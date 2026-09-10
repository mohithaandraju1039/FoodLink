import { db } from '../db/jsonDb';
import { FoodListing, FoodCategory, PackagingType, StorageTemp, DietaryTag, User } from '../../src/types';
import { generateId } from '../utils/helpers';
import { AuditService } from './audit.service';

export interface CreateListingInput {
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

export class ListingService {
  public static createListing(input: CreateListingInput, donor: User): FoodListing {
    db.autoCheckExpiration();

    // Validation
    if (!input.title || !input.title.trim()) {
      throw { statusCode: 400, message: 'Food title is required.' };
    }
    if (!input.description || !input.description.trim()) {
      throw { statusCode: 400, message: 'Description is required.' };
    }
    if (input.quantityServings <= 0) {
      throw { statusCode: 400, message: 'Quantity in servings must be greater than zero.' };
    }
    if (!input.pickupAddress || !input.pickupAddress.trim()) {
      throw { statusCode: 400, message: 'Pickup address is required.' };
    }
    if (!input.city || !input.city.trim()) {
      throw { statusCode: 400, message: 'City is required.' };
    }

    const prepDate = new Date(input.preparedAt);
    const expDate = new Date(input.expiresAt);
    const now = new Date();

    if (isNaN(prepDate.getTime()) || isNaN(expDate.getTime())) {
      throw { statusCode: 400, message: 'Invalid prepared or expiry date format.' };
    }

    if (expDate <= prepDate) {
      throw { statusCode: 400, message: 'Expiry time must be strictly after the preparation time.' };
    }

    if (expDate <= now) {
      throw { statusCode: 400, message: 'Expiry time cannot be in the past.' };
    }

    if (!input.hygieneChecked) {
      throw { statusCode: 400, message: 'You must confirm the hygiene and safety declaration checklist.' };
    }

    const newListing: FoodListing = {
      id: generateId('lst'),
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      quantityServings: Number(input.quantityServings),
      quantityKgOrItems: input.quantityKgOrItems.trim(),
      preparedAt: new Date(input.preparedAt).toISOString(),
      expiresAt: new Date(input.expiresAt).toISOString(),
      packagingType: input.packagingType,
      storageTemp: input.storageTemp || 'ROOM_TEMP',
      dietaryTags: input.dietaryTags || [],
      hygieneChecked: true,
      pickupAddress: input.pickupAddress.trim(),
      landmark: (input.landmark || '').trim(),
      city: input.city.trim(),
      pincode: (input.pincode || '').trim(),
      donorId: donor.id,
      donorName: donor.name,
      donorPhone: donor.phone,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      imageUrl: input.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    };

    const dbData = db.getData();
    dbData.listings.unshift(newListing);
    db.save();

    AuditService.log({
      action: 'LISTING_CREATED',
      actorId: donor.id,
      actorName: donor.name,
      actorRole: donor.role,
      targetType: 'LISTING',
      targetId: newListing.id,
      details: `Created donation listing "${newListing.title}" (${newListing.quantityServings} servings) in ${newListing.city}.`,
    });

    return newListing;
  }

  public static getListings(filters?: {
    status?: string;
    category?: string;
    city?: string;
    search?: string;
    donorId?: string;
    claimedByReceiverId?: string;
  }): FoodListing[] {
    db.autoCheckExpiration();
    const dbData = db.getData();
    let result = [...dbData.listings];

    if (filters?.status) {
      result = result.filter((l) => l.status === filters.status);
    }
    if (filters?.category) {
      result = result.filter((l) => l.category === filters.category);
    }
    if (filters?.city) {
      result = result.filter((l) => l.city.toLowerCase() === filters.city!.toLowerCase());
    }
    if (filters?.donorId) {
      result = result.filter((l) => l.donorId === filters.donorId);
    }
    if (filters?.claimedByReceiverId) {
      result = result.filter((l) => l.claimedByReceiverId === filters.claimedByReceiverId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.donorName.toLowerCase().includes(q)
      );
    }

    return result.map((l) => {
      const task = dbData.tasks.find((t) => t.listingId === l.id);
      if (task) {
        return {
          ...l,
          volunteerStatus: task.status,
          volunteerName: task.volunteerName,
          volunteerPhone: task.volunteerPhone,
        };
      }
      return l;
    });
  }

  public static getListingById(id: string): FoodListing {
    db.autoCheckExpiration();
    const dbData = db.getData();
    const listing = dbData.listings.find((l) => l.id === id);

    if (!listing) {
      throw { statusCode: 404, message: 'Food listing not found.' };
    }

    const task = dbData.tasks.find((t) => t.listingId === listing.id);
    if (task) {
      return {
        ...listing,
        volunteerStatus: task.status,
        volunteerName: task.volunteerName,
        volunteerPhone: task.volunteerPhone,
      };
    }

    return listing;
  }

  public static cancelListing(id: string, actor: User): FoodListing {
    db.autoCheckExpiration();
    const dbData = db.getData();
    const listing = dbData.listings.find((l) => l.id === id);

    if (!listing) {
      throw { statusCode: 404, message: 'Food listing not found.' };
    }

    if (actor.role !== 'ADMIN' && listing.donorId !== actor.id) {
      throw { statusCode: 403, message: 'You are not authorized to cancel this listing.' };
    }

    if (listing.status !== 'ACTIVE') {
      throw { statusCode: 400, message: `Cannot cancel listing with status "${listing.status}". Only active listings can be cancelled.` };
    }

    listing.status = 'CANCELLED';
    db.save();

    AuditService.log({
      action: 'LISTING_CANCELLED',
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      targetType: 'LISTING',
      targetId: listing.id,
      details: `Cancelled listing "${listing.title}".`,
    });

    return listing;
  }
}
