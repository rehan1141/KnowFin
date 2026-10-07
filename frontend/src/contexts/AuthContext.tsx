import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserUpdate } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string, defaultCurrency?: string) => Promise<void>;
  updateUser: (data: UserUpdate) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadUser = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const currentUser = await authService.getMe();
      setUser(currentUser);
      if (currentUser.default_currency) {
        localStorage.setItem('preferred_currency', currentUser.default_currency);
      }
    } catch {
      localStorage.removeItem('access_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    localStorage.setItem('access_token', response.access_token);
    setToken(response.access_token);

    const currentUser = await authService.getMe();
    setUser(currentUser);
    if (currentUser.default_currency) {
      localStorage.setItem('preferred_currency', currentUser.default_currency);
    }
  };

  const register = async (email: string, password: string, fullName?: string, defaultCurrency: string = 'EUR') => {
    await authService.register({
      email,
      password,
      full_name: fullName,
      default_currency: defaultCurrency as any,
    });
    await login(email, password);
  };

  const updateUser = async (data: UserUpdate) => {
    const updated = await authService.updateProfile(data);
    setUser(updated);
    if (updated.default_currency) {
      localStorage.setItem('preferred_currency', updated.default_currency);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      const u = await authService.getMe();
      setUser(u);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, updateUser, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
