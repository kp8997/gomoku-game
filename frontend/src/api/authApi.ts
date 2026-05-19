import type { LoginRequest, SignupRequest, AuthResponse, UserProfile, ConfrontationRecord, UserStatsDTO, AchievementResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 
  (window.location.protocol === 'https:' 
    ? `https://${window.location.hostname}` 
    : `http://${window.location.hostname}:8888`);

console.log('Gomoku API Base resolved to:', API_BASE);
console.log('VITE_API_URL env variable is:', import.meta.env.VITE_API_URL);

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
    const response = await fetch(`${API_BASE}/api/user/profile`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  updateProfile: async (token: string, data: { fullName?: string, avatar?: string }): Promise<UserProfile & { confrontations: ConfrontationRecord[] }> => {
    const response = await fetch(`${API_BASE}/api/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },

  getStats: async (token: string): Promise<UserStatsDTO> => {
    const response = await fetch(`${API_BASE}/api/user/stats`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  getAchievements: async (token: string): Promise<AchievementResponse> => {
    const response = await fetch(`${API_BASE}/api/user/achievements`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch achievements');
    return response.json();
  },

  equipEffect: async (token: string, effectKey: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/api/user/achievements/equip`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ effectKey }),
    });
    if (!response.ok) throw new Error('Failed to equip effect');
  },

  unequipEffect: async (token: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/api/user/achievements/unequip`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to unequip effect');
  },
};
