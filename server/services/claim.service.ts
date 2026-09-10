import { db } from '../db/jsonDb';
import { FoodListing, VolunteerTask, User } from '../../src/types';
import { generateClaimCode, generateId } from '../utils/helpers';
import { AuditService } from './audit.service';

export interface ClaimInput {
  listingId: string;
  estimatedPickupTime: string;
  claimNotes?: string;
  deliveryAddressOverride?: string;
}

export class ClaimService {
  public static claimFood(input: ClaimInput, receiver: User): { listing: FoodListing; task: VolunteerTask } {
    db.autoCheckExpiration();
    const dbData = db.getData();
    const listing = dbData.listings.find((l) => l.id === input.listingId);

    if (!listing) {
      throw { statusCode: 404, message: 'Food listing not found.' };
    }

    if (listing.status !== 'ACTIVE') {
      throw { statusCode: 400, message: `This food item is no longer active (Status: ${listing.status}).` };
    }

    const claimCode = generateClaimCode();
    const claimedAt = new Date().toISOString();

    // Update listing
    listing.status = 'CLAIMED';
    listing.claimedByReceiverId = receiver.id;
    listing.claimedByReceiverName = receiver.name;
    listing.claimedByReceiverOrg = receiver.organization || receiver.name;
    listing.claimedByReceiverPhone = receiver.phone;
    listing.claimedAt = claimedAt;
    listing.estimatedPickupTime = input.estimatedPickupTime || 'Within 1-2 hours';
    listing.claimCode = claimCode;
    listing.claimNotes = input.claimNotes || '';

    // Create volunteer task
    const newTask: VolunteerTask = {
      id: generateId('tsk'),
      listingId: listing.id,
      listingTitle: listing.title,
      category: listing.category,
      quantityServings: listing.quantityServings,
      donorId: listing.donorId,
      donorName: listing.donorName,
      donorPhone: listing.donorPhone,
      pickupAddress: `${listing.pickupAddress}${listing.landmark ? `, Near ${listing.landmark}` : ''}, ${listing.city}`,
      receiverId: receiver.id,
      receiverName: receiver.name,
      receiverPhone: receiver.phone,
      deliveryAddress: input.deliveryAddressOverride || `${receiver.organization || receiver.name}, ${receiver.city}`,
      claimCode,
      status: 'AVAILABLE',
      createdAt: claimedAt,
    };

    dbData.tasks.unshift(newTask);
    db.save();

    AuditService.log({
      action: 'FOOD_CLAIMED',
      actorId: receiver.id,
      actorName: receiver.name,
      actorRole: receiver.role,
      targetType: 'LISTING',
      targetId: listing.id,
      details: `Claimed listing "${listing.title}" with verification code ${claimCode}.`,
    });

    return { listing, task: newTask };
  }

  public static getReceiverClaims(receiverId: string): FoodListing[] {
    db.autoCheckExpiration();
    const dbData = db.getData();
    // Strict receiver privacy: only return claims belonging to this receiverId
    return dbData.listings.filter((l) => l.claimedByReceiverId === receiverId);
  }
}
