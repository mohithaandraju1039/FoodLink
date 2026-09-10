import { request } from './client';
import { VolunteerTask, VolunteerTaskStatus } from '../types';

export const volunteerApi = {
  getTasks: (params?: {
    status?: string;
    volunteerId?: string;
    availableOnly?: boolean;
  }): Promise<VolunteerTask[]> => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.volunteerId) query.append('volunteerId', params.volunteerId);
    if (params?.availableOnly) query.append('availableOnly', 'true');

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<VolunteerTask[]>(`/api/volunteer/tasks${queryString}`);
  },

  getTaskById: (id: string): Promise<VolunteerTask> => {
    return request<VolunteerTask>(`/api/volunteer/tasks/${id}`);
  },

  acceptTask: (id: string): Promise<VolunteerTask> => {
    return request<VolunteerTask>(`/api/volunteer/tasks/${id}/accept`, {
      method: 'POST',
    });
  },

  updateTaskStatus: (
    id: string,
    status: VolunteerTaskStatus,
    claimCode?: string
  ): Promise<VolunteerTask> => {
    return request<VolunteerTask>(`/api/volunteer/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, claimCode }),
    });
  },
};
