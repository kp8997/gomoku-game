import React, { createContext, useContext, useState } from 'react';
import type { AuthResponse, LoginRequest, SignupRequest } from '../types';
import { authApi } from '../api/authApi';

interface AuthState {
  user: AuthResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (req: LoginRequest) => Promise<void>;
  signup: (req: SignupRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { fullName?: string; avatar?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(() => {
    const saved = localStorage.getItem('gomoku_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('gomoku_token'));
  const isLoading = false;

  const login = async (req: LoginRequest) => {
    const res = await authApi.login(req);
    setUser(res);
    setToken(res.token);
    localStorage.setItem('gomoku_token', res.token);
    localStorage.setItem('gomoku_user', JSON.stringify(res));
  };

  const signup = async (req: SignupRequest) => {
    const res = await authApi.signup(req);
    setUser(res);
    setToken(res.token);
    localStorage.setItem('gomoku_token', res.token);
    localStorage.setItem('gomoku_user', JSON.stringify(res));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('gomoku_token');
    localStorage.removeItem('gomoku_user');
  };

  const updateProfile = async (data: { fullName?: string; avatar?: string }) => {
    if (!token) return;
    const res = await authApi.updateProfile(token, data);
    const updatedUser = { ...user!, ...res };
    setUser(updatedUser);
    localStorage.setItem('gomoku_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token,
      isLoading,
      login,
      signup,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
