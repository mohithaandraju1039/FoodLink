export type UserRole = 'ADMIN' | 'DONOR' | 'RECEIVER' | 'VOLUNTEER';

export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  organization?: string;
  city: string;
  isVerified: boolean;
  status: UserStatus;
  joinedAt: string;
}

export type FoodCategory =
  | 'COOKED_MEALS'
  | 'BAKERY'
  | 'FRESH_PRODUCE'
  | 'RAW_INGREDIENTS'
  | 'PACKAGED_FOOD'
  | 'DAIRY'
  | 'BEVERAGES'
  | 'OTHER';

export type ListingStatus = 'ACTIVE' | 'CLAIMED' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';

export type PackagingType =
  | 'SEALED_CONTAINER'
  | 'BOXED'
  | 'BULK_TRAY'
  | 'INSULATED_BAG'
  | 'CANNED_PACKET'
  | 'OTHER';

export type StorageTemp = 'HOT' | 'COLD' | 'ROOM_TEMP';

export type DietaryTag = 'VEGETARIAN' | 'VEGAN' | 'HALAL' | 'NON_VEG' | 'NUT_FREE' | 'GLUTEN_FREE';

export interface FoodListing {
  id: string;
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
  donorId: string;
  donorName: string;
  donorPhone: string;
  status: ListingStatus;
  createdAt: string;
  imageUrl?: string;
  claimedByReceiverId?: string;
  claimedByReceiverName?: string;
  claimedByReceiverOrg?: string;
  claimedByReceiverPhone?: string;
  claimedAt?: string;
  estimatedPickupTime?: string;
  claimCode?: string;
  claimNotes?: string;
  volunteerStatus?: VolunteerTaskStatus;
  volunteerName?: string;
  volunteerPhone?: string;
  moderatedByAdmin?: boolean;
  moderationNote?: string;
}

export type VolunteerTaskStatus =
  | 'AVAILABLE'
  | 'ACCEPTED'
  | 'PICKUP_IN_PROGRESS'
  | 'PICKED_UP'
  | 'DELIVERY_IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface VolunteerTask {
  id: string;
  listingId: string;
  listingTitle: string;
  category: FoodCategory;
  quantityServings: number;
  donorId: string;
  donorName: string;
  donorPhone: string;
  pickupAddress: string;
  receiverId: string;
  receiverName: string;
  receiverPhone: string;
  deliveryAddress: string;
  volunteerId?: string;
  volunteerName?: string;
  volunteerPhone?: string;
  claimCode: string;
  status: VolunteerTaskStatus;
  acceptedAt?: string;
  pickupStartedAt?: string;
  pickedUpAt?: string;
  deliveryStartedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export type AuditAction =
  | 'LISTING_CREATED'
  | 'LISTING_UPDATED'
  | 'LISTING_CANCELLED'
  | 'FOOD_CLAIMED'
  | 'DELIVERY_ACCEPTED'
  | 'PICKUP_STARTED'
  | 'FOOD_PICKED_UP'
  | 'DELIVERY_COMPLETED'
  | 'LISTING_COMPLETED'
  | 'LISTING_EXPIRED'
  | 'USER_REGISTERED'
  | 'USER_VERIFIED'
  | 'USER_SUSPENDED'
  | 'LISTING_MODERATED'
  | 'SYSTEM_SETTINGS_UPDATED';

export interface AuditLog {
  id: string;
  timestamp: string;
  action: AuditAction;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  targetType: string;
  targetId: string;
  details: string;
  status: 'SUCCESS' | 'FAILURE';
}

export interface SystemSettings {
  platformName: string;
  autoExpireHours: number;
  hygieneDeclarationMandatory: boolean;
  allowDirectReceiverPickup: boolean;
  announcementBanner: string;
  contactSupportEmail: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalDonors: number;
  totalReceivers: number;
  totalVolunteers: number;
  activeListings: number;
  claimedListings: number;
  completedDeliveries: number;
  expiredListings: number;
  totalServingsSaved: number;
  estimatedKgSaved: number;
  pendingVerifications: number;
}

export type Language =
  | 'en'
  | 'te'
  | 'hi'
  | 'ta'
  | 'kn'
  | 'ml'
  | 'mr'
  | 'bn'
  | 'gu'
  | 'pa'
  | 'ur'
  | 'or'
  | 'as'
  | 'es'
  | 'fr';

export type ThemePreset =
  | 'food-green'
  | 'ocean-blue'
  | 'royal-purple'
  | 'sunset'
  | 'teal-mint'
  | 'midnight';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  actAsRole?: UserRole | null; // For ADMIN view-as mode
}
