import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  institution?: string;
  educationLevel?: string;
  interests?: string;
}

interface StoredAccount {
  id: number;
  name: string;
  email: string;
  password: string;
  institution?: string;
  educationLevel?: string;
  interests?: string;
  accessibilityPreferences?: Record<string, boolean | string>;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  institution?: string;
  educationLevel?: string;
  interests?: string;
  accessibilityPreferences?: Record<string, boolean | string>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_USERS_KEY = 'saksham_registered_accounts';

function getStoredAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAccountLocally(account: StoredAccount) {
  try {
    const accounts = getStoredAccounts();
    const filtered = accounts.filter(a => a.email.toLowerCase() !== account.email.toLowerCase());
    filtered.push(account);
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to save account locally', e);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('saksham_token');
    const savedUser = localStorage.getItem('saksham_user');
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      } catch {
        localStorage.removeItem('saksham_token');
        localStorage.removeItem('saksham_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (emailInput: string, passwordInput: string) => {
    const normalizedEmail = emailInput.trim().toLowerCase();
    const normalizedPassword = passwordInput.trim();

    // 1. Try live server authentication first
    try {
      const res = await axios.post('/api/auth/login', {
        email: normalizedEmail,
        password: normalizedPassword,
      });
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('saksham_token', newToken);
      localStorage.setItem('saksham_user', JSON.stringify(newUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      // Also save locally as offline backup
      saveAccountLocally({
        id: newUser.id,
        name: newUser.name,
        email: normalizedEmail,
        password: normalizedPassword,
      });
      return;
    } catch (err: any) {
      // If server responded with a deliberate 400/401/409 error (wrong password, account not found)
      const isNetworkError = !err.response || err.code === 'ERR_NETWORK' || err.response.status >= 500;
      
      // If not a network error, check if the local account matches
      const localAccounts = getStoredAccounts();
      const matched = localAccounts.find(a => a.email.toLowerCase() === normalizedEmail);

      if (matched) {
        if (matched.password === normalizedPassword) {
          const offlineToken = `offline_token_${Date.now()}_${matched.id}`;
          const offlineUser: User = { id: matched.id, name: matched.name, email: matched.email };
          setToken(offlineToken);
          setUser(offlineUser);
          localStorage.setItem('saksham_token', offlineToken);
          localStorage.setItem('saksham_user', JSON.stringify(offlineUser));
          axios.defaults.headers.common['Authorization'] = `Bearer ${offlineToken}`;
          return;
        } else {
          throw new Error('Invalid email or password.');
        }
      }

      // If network failed and it's a test/demo account
      if (isNetworkError) {
        if (normalizedEmail === 'test@example.com' && normalizedPassword === 'password123') {
          const demoUser: User = { id: 1, name: 'Test User', email: 'test@example.com' };
          const demoToken = `demo_token_${Date.now()}`;
          setToken(demoToken);
          setUser(demoUser);
          localStorage.setItem('saksham_token', demoToken);
          localStorage.setItem('saksham_user', JSON.stringify(demoUser));
          return;
        }
        throw new Error('Account not found on this device or server is unreachable.');
      }

      // Re-throw server error
      throw err;
    }
  };

  const register = async (data: RegisterData) => {
    const normalizedEmail = data.email.trim().toLowerCase();
    const normalizedPassword = data.password.trim();
    const normalizedName = data.name.trim();

    // 1. Try server registration first
    try {
      const res = await axios.post('/api/auth/register', {
        ...data,
        name: normalizedName,
        email: normalizedEmail,
        password: normalizedPassword,
      });
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('saksham_token', newToken);
      localStorage.setItem('saksham_user', JSON.stringify(newUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      // Save locally as backup
      saveAccountLocally({
        id: newUser.id,
        name: normalizedName,
        email: normalizedEmail,
        password: normalizedPassword,
        accessibilityPreferences: data.accessibilityPreferences,
      });
      return;
    } catch (err: any) {
      const isNetworkError = !err.response || err.code === 'ERR_NETWORK' || err.response.status >= 500;

      // If backend is unavailable (e.g. standalone mobile APK), register locally!
      if (isNetworkError) {
        const localId = Date.now();
        const localUser: User = {
          id: localId,
          name: normalizedName,
          email: normalizedEmail,
        };
        const localToken = `local_token_${localId}`;

        saveAccountLocally({
          id: localId,
          name: normalizedName,
          email: normalizedEmail,
          password: normalizedPassword,
          accessibilityPreferences: data.accessibilityPreferences,
        });

        setToken(localToken);
        setUser(localUser);
        localStorage.setItem('saksham_token', localToken);
        localStorage.setItem('saksham_user', JSON.stringify(localUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${localToken}`;
        return;
      }

      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('saksham_token');
    localStorage.removeItem('saksham_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

