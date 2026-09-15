import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";
import { postData, setTokens, clearTokens, UNAUTHORIZED_EVENT } from "../services/api";

type LoginDto = { email: string; password: string };
type TokenResponse = { accessToken: string; refreshToken: string };
type User = { id?: string; email?: string; role?: string };

type AuthContextType = {
    user: User | null;
    accessToken: string | null;
    loading: boolean;
    login: (credentials: LoginDto, persist?: boolean) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// .NET stamps claims under long URIs; fall back to short names just in case.
const CLAIM = {
    id: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
    email: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
    role: "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
};

function parseJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join(""),
        );
        return JSON.parse(json);
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [accessToken, setAccessToken] = useState<string | null>(
        () => localStorage.getItem("jp_access") ?? sessionStorage.getItem("jp_access"),
    );
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [notificationApi, contextHolder] = notification.useNotification();

    useEffect(() => {
        if (!accessToken) {
            setUser(null);
            return;
        }
        const p = parseJwtPayload(accessToken);
        if (p) {
            setUser({
                id: (p[CLAIM.id] as string) ?? (p["sub"] as string),
                email: (p[CLAIM.email] as string) ?? (p["email"] as string),
                role: (p[CLAIM.role] as string) ?? (p["role"] as string),
            });
        }
    }, [accessToken]);

    const login = async (credentials: LoginDto, persist = true) => {
        setLoading(true);
        try {
            const data = await postData<TokenResponse, LoginDto>("/auth/login", credentials);
            setTokens(data.accessToken, data.refreshToken, persist);
            setAccessToken(data.accessToken);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        clearTokens();
        setAccessToken(null);
        setUser(null);
    };

    // Global 401 (from authenticated reads) -> notify and bounce to login.
    useEffect(() => {
        const handler = () => {
            notificationApi.error({
                key: "session-expired",
                message: "Session expired",
                description: "Your session has ended. Please log in again.",
                duration: 3,
            });
            setTimeout(() => navigate("/login", { replace: true }), 2000);
        };
        window.addEventListener(UNAUTHORIZED_EVENT, handler);
        return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler);
    }, [navigate, notificationApi]);

    return (
        <>
            {contextHolder}
            <AuthContext.Provider value={{ user, accessToken, loading, login, logout }}>
                {children}
            </AuthContext.Provider>
        </>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}
