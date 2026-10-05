// Relative base — Vite dev proxy (vite.config.ts) forwards /api to the backend.
export const API_BASE_URL = "/api";

const ACCESS_KEY = "jp_access";
const REFRESH_KEY = "jp_refresh";

export const UNAUTHORIZED_EVENT = "jp:unauthorized";

function getStoredAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY) ?? sessionStorage.getItem(ACCESS_KEY);
}

// Backend errors come in two shapes:  ApiResponse { message } or ASP.NET
// validation ProblemDetails { title, errors: { Field: [msg] } }.
function errorMessage(json: any, res: Response): string {
    const validation = json?.errors && !Array.isArray(json.errors) ? Object.values(json.errors).flat()[0] : null;
    return (validation as string) || json?.message?.trim() || json?.title || `${res.status} ${res.statusText}`;
}

// Backend wraps every response in ApiResponse<T>; we return the `data` field.
async function request<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
    const token = getStoredAccessToken();
    const headers: Record<string, string> = { accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (body !== undefined) headers["Content-Type"] = "application/json";

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);

    // Only an expired session if we actually sent a token; a 401 on login is bad credentials.
    if (res.status === 401 && token) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    if (!res.ok) throw new Error(errorMessage(json, res));

    return json?.data as T;
}

export const fetchData = <T>(endpoint: string) => request<T>("GET", endpoint);
export const postData = <TResponse, TRequest = unknown>(endpoint: string, body: TRequest) =>
    request<TResponse>("POST", endpoint, body);
export const putData = <TResponse, TRequest = unknown>(endpoint: string, body?: TRequest) =>
    request<TResponse>("PUT", endpoint, body);
export const deleteData = <T = boolean>(endpoint: string) => request<T>("DELETE", endpoint);

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
