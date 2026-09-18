import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth, useLogin, useRegister, useLogout } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    displayName: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, error } = useAuth();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsRestored(true);
    }
  }, [isLoading]);

  useEffect(() => {
    if (
      isRestored &&
      error &&
      !location.pathname.startsWith("/login") &&
      !location.pathname.startsWith("/register")
    ) {
      navigate("/login", { replace: true });
    }
  }, [isRestored, error, location.pathname, navigate]);

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
    navigate("/", { replace: true });
  };

  const register = async (
    displayName: string,
    email: string,
    password: string,
  ) => {
    await registerMutation.mutateAsync({ displayName, email, password });
    navigate("/", { replace: true });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/login", { replace: true });
  };

  const value: AuthContextValue = {
    user: data?.user ?? null,
    isLoading: isLoading || !isRestored,
    isAuthenticated: !!data?.user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
