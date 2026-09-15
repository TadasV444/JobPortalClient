// Relative base — Vite dev proxy (vite.config.ts) forwards /api to the backend.
export const API_BASE_URL = "/api";

const ACCESS_KEY = "jp_access";
const REFRESH_KEY = "jp_refresh";

export const UNAUTHORIZED_EVENT = "jp:unauthorized";

function getStoredAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY) ?? sessionStorage.getItem(ACCESS_KEY);
}

function authHeaders(base: Record<string, string>): Record<string, string> {
    const token = getStoredAccessToken();
    if (token) base["Authorization"] = `Bearer ${token}`;
    return base;
}

// Backend wraps every response in ApiResponse<T>; we return the `data` field.
export async function fetchData<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: authHeaders({ accept: "application/json" }),
    });

    if (res.status === 401) {
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
        throw new Error("Unauthorized");
    }
    if (!res.ok) throw new Error(`Failed to fetch ${endpoint}: ${res.status} ${res.statusText}`);

    const json = await res.json();
    return json.data as T;
}

// No 401 event here on purpose: a 401 during login is bad credentials, not an expired session.
export async function postData<TResponse, TRequest = unknown>(
    endpoint: string,
    body: TRequest,
): Promise<TResponse> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json", accept: "application/json" }),
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Failed to post ${endpoint}: ${res.status} ${res.statusText} ${text}`);
    }

    const json = await res.json();
    return json.data as TResponse;
}

export function setTokens(accessToken: string, refreshToken?: string, persist = true) {
    const store = persist ? localStorage : sessionStorage;
    store.setItem(ACCESS_KEY, accessToken);
    if (refreshToken) store.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    sessionStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
}
