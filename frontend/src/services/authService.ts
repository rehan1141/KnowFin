import { api } from './api';
import type { UserRegister, TokenResponse, User } from '../types';

export const authService = {
  register: async (data: UserRegister): Promise<User> => {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  },

  login: async (email: string, password: string): Promise<TokenResponse> => {
    // FastAPI OAuth2 expects form-encoded data, not JSON
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post<TokenResponse>('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};
