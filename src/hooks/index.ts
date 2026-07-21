import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import type { UserRole } from "../types";

export function useRouteGuard(allowedRoles: UserRole[]) {
  const currentUser = useAppStore((s) => s.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/auth", { replace: true });
      return;
    }
    if (!allowedRoles.includes(currentUser.role)) {
      navigate(`/${currentUser.role}`, { replace: true });
    }
  }, [currentUser, allowedRoles, navigate]);

  return currentUser;
}
