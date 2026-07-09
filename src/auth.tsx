import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  api,
  clearAccessToken,
  setUnauthorizedHandler,
  type User,
} from "@/lib/api";

const AuthContext = createContext<{
  loading: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
} | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    api
      .refresh()
      .then(() => api.me())
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setUser(await api.login({ username, password }));
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    clearAccessToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ loading, user, login, logout }),
    [loading, login, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
