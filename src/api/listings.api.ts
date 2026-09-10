import { request } from './client';
import { FoodListing, FoodCategory, PackagingType, StorageTemp, DietaryTag } from '../types';

export interface CreateListingParams {
  title: string;
  description: string;
  category: FoodCategory;
  quantityServings: number;
  quantityKgOrItems: string;
  preparedAt: string;
  expiresAt: string;
  packagingType: PackagingType;
  storageTemp: StorageTemp;
  dietaryTags: DietaryTag[];
  hygieneChecked: boolean;
  pickupAddress: string;
  landmark: string;
  city: string;
  pincode?: string;
  imageUrl?: string;
}

export const listingsApi = {
  getListings: (params?: {
    status?: string;
    category?: string;
    city?: string;
    search?: string;
    donorId?: string;
    claimedByReceiverId?: string;
  }): Promise<FoodListing[]> => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.category) query.append('category', params.category);
    if (params?.city) query.append('city', params.city);
    if (params?.search) query.append('search', params.search);
    if (params?.donorId) query.append('donorId', params.donorId);
    if (params?.claimedByReceiverId) query.append('claimedByReceiverId', params.claimedByReceiverId);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<FoodListing[]>(`/api/listings${queryString}`);
  },

  getListingById: (id: string): Promise<FoodListing> => {
    return request<FoodListing>(`/api/listings/${id}`);
  },

  createListing: (data: CreateListingParams): Promise<FoodListing> => {
    return request<FoodListing>('/api/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  cancelListing: (id: string): Promise<FoodListing> => {
    return request<FoodListing>(`/api/listings/${id}/cancel`, {
      method: 'PATCH',
    });
  },
};
