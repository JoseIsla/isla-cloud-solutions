import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';

const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const WARNING_BEFORE_MS = 60 * 1000; // warn 1 minute before

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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('islacloud_token');
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    toast.dismiss('session-warning');
  }, []);

  // Reset inactivity timer on user activity
  const resetTimer = useCallback(() => {
    if (!sessionStorage.getItem('islacloud_token')) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    toast.dismiss('session-warning');

    warningRef.current = setTimeout(() => {
      toast.warning('Tu sesión expirará en 1 minuto por inactividad. Interactúa para mantenerla activa.', {
        id: 'session-warning',
        duration: WARNING_BEFORE_MS,
      });
    }, INACTIVITY_TIMEOUT_MS - WARNING_BEFORE_MS);

    timerRef.current = setTimeout(() => {
      logout();
      toast.info('Sesión cerrada por inactividad.');
    }, INACTIVITY_TIMEOUT_MS);
  }, [logout]);

  // Attach activity listeners when authenticated
  useEffect(() => {
    if (!token) return;

    const events: (keyof WindowEventMap)[] = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handler = () => resetTimer();

    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    resetTimer(); // start timer

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [token, resetTimer]);

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

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
