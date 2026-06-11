import type { LoginRequest, SignupRequest, AuthResponse, UserProfile, ConfrontationRecord, UserStatsDTO, AchievementResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_URL === '/api' ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:8888');

const authenticatedFetch = async (url: string, options: RequestInit = {}, token: string) => {
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('gomoku_token');
    localStorage.removeItem('gomoku_user');
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
    throw new Error('Session expired. Please log in again.');
  }

  return response;
};

export const authApi = {
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }
    return response.json();
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    return response.json();
  },

  getProfile: async (token: string): Promise<UserProfile & { confrontations: ConfrontationRecord[] }> => {
    const response = await authenticatedFetch(`${API_BASE}/api/user/profile`, {}, token);
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  updateProfile: async (token: string, data: { fullName?: string, avatar?: string }): Promise<UserProfile & { confrontations: ConfrontationRecord[] }> => {
    const response = await authenticatedFetch(`${API_BASE}/api/user/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }, token);
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },

  getStats: async (token: string): Promise<UserStatsDTO> => {
    const response = await authenticatedFetch(`${API_BASE}/api/user/stats`, {}, token);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  getAchievements: async (token: string): Promise<AchievementResponse> => {
    const response = await authenticatedFetch(`${API_BASE}/api/user/achievements`, {}, token);
    if (!response.ok) throw new Error('Failed to fetch achievements');
    return response.json();
  },

  equipEffect: async (token: string, effectKey: string): Promise<void> => {
    const response = await authenticatedFetch(`${API_BASE}/api/user/achievements/equip`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ effectKey }),
    }, token);
    if (!response.ok) throw new Error('Failed to equip effect');
  },

  unequipEffect: async (token: string): Promise<void> => {
    const response = await authenticatedFetch(`${API_BASE}/api/user/achievements/unequip`, {
      method: 'PUT',
    }, token);
    if (!response.ok) throw new Error('Failed to unequip effect');
  },

  equipSkin: async (token: string, skinKey: string): Promise<void> => {
    const response = await authenticatedFetch(`${API_BASE}/api/user/achievements/equip-skin`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skinKey }),
    }, token);
    if (!response.ok) throw new Error('Failed to equip skin');
  },

  unequipSkin: async (token: string): Promise<void> => {
    const response = await authenticatedFetch(`${API_BASE}/api/user/achievements/unequip-skin`, {
      method: 'PUT',
    }, token);
    if (!response.ok) throw new Error('Failed to unequip skin');
  },
};
