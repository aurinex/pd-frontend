import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getMe } from "../services/authService";

interface UserData {
  _id: string;
  name: string;
  surname: string;
  email: string;
  roles: ("user" | "officer" | "admin")[];
}

const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: any) => {
  const [user, setUser] = useState<UserData | null>(() => {
    const stored = localStorage.getItem("pd_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(!!localStorage.getItem("token"));

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await getMe();
      if (data) {
        const userData: UserData = {
          _id: data.user_id,
          name: data.name,
          surname: data.surname,
          email: data.email,
          roles: data.roles || ["user"],
        };
        localStorage.setItem("pd_user", JSON.stringify(userData));
        setUser(userData);
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("pd_user");
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("token")) return;

    fetchUser();

    const onFocus = () => fetchUser();
    const interval = setInterval(fetchUser, 30000);

    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
  }, [fetchUser]);

  const login = useCallback((userData: UserData, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("pd_user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("pd_user");
    setUser(null);
  }, []);

  const refreshUser = useCallback(() => {
    fetchUser();
  }, [fetchUser]);

  const isOfficer = user?.roles?.includes("officer") || user?.roles?.includes("admin");
  const isAdmin = user?.roles?.includes("admin");

  return (
    <UserContext.Provider value={{ user, login, logout, isOfficer, isAdmin, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
