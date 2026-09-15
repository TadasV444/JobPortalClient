import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function ProtectedRoute() {
    const { accessToken } = useAuth();
    const location = useLocation();
    if (!accessToken) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return <Outlet />;
}
