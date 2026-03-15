import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function PublicOnlyRoute() {
  const { isAuthenticated, role, loading, getDashboardPath } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to={getDashboardPath()} replace />;
  }

  return <Outlet />;
}