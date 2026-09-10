import { request } from './client';
import { PlatformStats, User, SystemSettings, AuditLog } from '../types';

export const adminApi = {
  getStats: (): Promise<PlatformStats> => {
    return request<PlatformStats>('/api/admin/stats');
  },

  getUsers: (params?: { role?: string; status?: string; search?: string }): Promise<User[]> => {
    const query = new URLSearchParams();
    if (params?.role) query.append('role', params.role);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<User[]>(`/api/admin/users${queryString}`);
  },

  toggleVerifyUser: (userId: string): Promise<User> => {
    return request<User>(`/api/admin/users/${userId}/verify`, {
      method: 'PATCH',
    });
  },

  toggleSuspendUser: (userId: string): Promise<User> => {
    return request<User>(`/api/admin/users/${userId}/suspend`, {
      method: 'PATCH',
    });
  },

  getSettings: (): Promise<SystemSettings> => {
    return request<SystemSettings>('/api/admin/settings');
  },

  updateSettings: (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
    return request<SystemSettings>('/api/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  },

  getAuditLogs: (params?: {
    action?: string;
    actorRole?: string;
    search?: string;
    limit?: number;
  }): Promise<AuditLog[]> => {
    const query = new URLSearchParams();
    if (params?.action) query.append('action', params.action);
    if (params?.actorRole) query.append('actorRole', params.actorRole);
    if (params?.search) query.append('search', params.search);
    if (params?.limit) query.append('limit', params.limit.toString());

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<AuditLog[]>(`/api/audit-logs${queryString}`);
  },
};
