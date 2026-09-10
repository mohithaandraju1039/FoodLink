import { request } from './client';
import { User, UserRole } from '../types';

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  organization?: string;
  city: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: (data: LoginParams): Promise<AuthResponse> => {
    return request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  register: (data: RegisterParams): Promise<AuthResponse> => {
    return request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMe: (): Promise<User> => {
    return request<User>('/api/auth/me');
  },
};
