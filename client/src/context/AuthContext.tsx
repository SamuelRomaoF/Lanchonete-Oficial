import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  name: string;
  email: string;
  type: 'cliente' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      const response = await fetch("/.netlify/functions/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Dados do usuário recuperados:", data);
        setUser(data);
      } else {
        // Token inválido ou expirado
        localStorage.removeItem('auth_token');
        setUser(null);
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      localStorage.removeItem('auth_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    checkAuth();
  }, []);
  
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/.netlify/functions/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro no login:", errorData);
        throw new Error(errorData.error || "Erro ao fazer login");
      }
      
      const data = await response.json();
      console.log("Login bem-sucedido:", data);
      
      // Armazenar token no localStorage
      localStorage.setItem('auth_token', data.token);
      
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error("Erro durante o login:", error);
      throw error;
    }
  };
  
  const logout = async () => {
    // Limpar token do localStorage
    localStorage.removeItem('auth_token');
    setUser(null);
  };
  
  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
