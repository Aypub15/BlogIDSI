import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { authApi, setToken, type ApiUser } from "../api/client";

type AuthContextType = {
  session: { user: ApiUser } | null;
  user: ApiUser | null;
  profile: { role: "USER" | "ADMIN" } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.me()
      .then(setUser)
      .catch(() => {
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const payload = await authApi.login(email, password);
    setToken(payload.token);
    setUser(payload.user);
  };

  const signup = async (email: string, password: string, name?: string) => {
    const payload = await authApi.register(name || email.split("@")[0], email, password);
    setToken(payload.token);
    setUser(payload.user);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await authApi.changePassword(currentPassword, newPassword);
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
  };

  const value = useMemo<AuthContextType>(() => ({
    session: user ? { user } : null,
    user,
    profile: user ? { role: user.role } : null,
    loading,
    login,
    signup,
    changePassword,
    logout,
    isAdmin: user?.role === "ADMIN",
  }), [user, loading]);

  if (loading) return <div>Loading...</div>;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
