import { useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router";
import { useAuthContext } from "@/hooks/useAuthContext";
import { LoadingState } from "@/components/ui/Feedback";

function ProtectedRoutes() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState message="Restoring session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

function PublicRoutes() {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return <LoadingState message="Checking session..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export { ProtectedRoutes, PublicRoutes };
