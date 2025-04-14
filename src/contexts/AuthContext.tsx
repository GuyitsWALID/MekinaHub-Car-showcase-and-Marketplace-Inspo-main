import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
  } from "react";
  
  
  export interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  }
  
  interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: { name: string; email: string; password: string }) => Promise<void>;
    logout: () => void;
  }
  
 
  const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    login: async () => {},
    register: async () => {},
    logout: () => {},
  });
  
  
  //
  export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
  
    // On mount: try to rehydrate from localStorage
    useEffect(() => {
      const token = localStorage.getItem("auth_token");
      const stored = localStorage.getItem("auth_user");
      if (token && stored) {
        setUser(JSON.parse(stored));
        // e.g. axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
      setIsLoading(false);
    }, []);
  
    const login = async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const resp = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!resp.ok) throw new Error("Login failed");
        const { token, user: userData } = (await resp.json()) as {
          token: string;
          user: User;
        };
        localStorage.setItem("auth_token", token);
        localStorage.setItem("auth_user", JSON.stringify(userData));
        setUser(userData);
        // axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } finally {
        setIsLoading(false);
      }
    };
  
    const register = async (data: { name: string; email: string; password: string }) => {
      setIsLoading(true);
      try {
        const resp = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!resp.ok) throw new Error("Registration failed");
        const { token, user: userData } = (await resp.json()) as {
          token: string;
          user: User;
        };
        localStorage.setItem("auth_token", token);
        localStorage.setItem("auth_user", JSON.stringify(userData));
        setUser(userData);
        // axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } finally {
        setIsLoading(false);
      }
    };
  
    const logout = () => {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      setUser(null);
      // delete axios.defaults.headers.common["Authorization"];
    };
  
    return (
      <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
        {children}
      </AuthContext.Provider>
    );
  };
  

  export const useAuth = () => useContext(AuthContext);
  