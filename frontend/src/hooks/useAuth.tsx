import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { authApi } from '../services/api';

// ─── Context types ─────────────────────────────────────────────────────────────
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'mrs_token';
const USER_KEY = 'mrs_user';

// ─── Auth Provider ─────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);

    if (token && userStr) {
      try {
        const user: User = JSON.parse(userStr);
        setAuthState({ user, token, isAuthenticated: true });
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const saveSession = (user: User, token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setAuthState({ user, token, isAuthenticated: true });
  };

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    if (!data.success) throw new Error(data.message);
    saveSession(data.data.user, data.data.token);
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await authApi.register({ name, email, password });
    if (!data.success) throw new Error(data.message);
    saveSession(data.data.user, data.data.token);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthState({ user: null, token: null, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── useAuth hook ──────────────────────────────────────────────────────────────
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
