import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  devLogin: () => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = sessionStorage.getItem('islacloud_token');
    if (savedToken) {
      authApi.me(savedToken)
        .then((u) => {
          setUser(u);
          setToken(savedToken);
        })
        .catch(() => {
          sessionStorage.removeItem('islacloud_token');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setToken(res.token);
    setUser(res.user);
    sessionStorage.setItem('islacloud_token', res.token);
  };

  const devLogin = () => {
    const fakeUser: User = { id: 0, email: 'dev@localhost', name: 'Dev Admin', role: 'admin' };
    setUser(fakeUser);
    setToken('dev-token');
    sessionStorage.setItem('islacloud_token', 'dev-token');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('islacloud_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, devLogin, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
