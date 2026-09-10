import { request } from './client';
import { FoodListing, VolunteerTask } from '../types';

export interface ClaimFoodParams {
  listingId: string;
  estimatedPickupTime: string;
  claimNotes?: string;
  deliveryAddressOverride?: string;
}

export const claimsApi = {
  claimFood: (data: ClaimFoodParams): Promise<{ listing: FoodListing; task: VolunteerTask }> => {
    return request<{ listing: FoodListing; task: VolunteerTask }>('/api/claims', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMyClaims: (): Promise<FoodListing[]> => {
    return request<FoodListing[]>('/api/claims/my');
  },
};
