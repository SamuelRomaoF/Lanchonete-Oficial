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
      
      // Tentar recuperar dados do usuário da localStorage primeiro
      const storedUser = localStorage.getItem('user_data');
      if (storedUser) {
        console.log("Usando dados de usuário armazenados:", storedUser);
        setUser(JSON.parse(storedUser));
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch("/.netlify/functions/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("Dados do usuário recuperados:", data);
          setUser(data);
          // Salvar dados do usuário localmente
          localStorage.setItem('user_data', JSON.stringify(data));
        } else {
          // Token inválido ou expirado
          console.log("Token inválido ou erro na API");
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          setUser(null);
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação via API:", error);
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
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
      console.log("Tentando login com:", { email, password });
      
      // Para desenvolvimento: permitir login de administrador com credenciais de teste
      if (email === "admin@lanchonete.com" && password === "admin123") {
        console.log("Login de teste bem-sucedido");
        
        const mockUser = {
          id: "1",
          name: "Administrador",
          email: "admin@lanchonete.com",
          type: "admin" as const
        };
        
        // Criar um token de teste
        const testToken = "test_token_" + Date.now();
        
        // Armazenar token no localStorage
        localStorage.setItem('auth_token', testToken);
        localStorage.setItem('user_data', JSON.stringify(mockUser));
        
        setUser(mockUser);
        return;
      }
      
      // Tentativa de login com a API real
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
          console.error("Erro no login via API:", errorData);
          throw new Error(errorData.error || "Erro ao fazer login");
        }
        
        const data = await response.json();
        console.log("Login bem-sucedido via API:", data);
        
        // Armazenar token no localStorage
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        
        setUser(data.user);
      } catch (apiError) {
        console.error("Erro na chamada da API de login:", apiError);
        throw apiError;
      }
    } catch (error) {
      console.error("Erro durante o login:", error);
      throw error;
    }
  };
  
  const logout = async () => {
    // Limpar token do localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
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
