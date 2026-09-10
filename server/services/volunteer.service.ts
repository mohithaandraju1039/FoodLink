import { db } from '../db/jsonDb';
import { VolunteerTask, VolunteerTaskStatus, User } from '../../src/types';
import { AuditService } from './audit.service';

export class VolunteerService {
  public static getTasks(filters?: {
    status?: string;
    volunteerId?: string;
    availableOnly?: boolean;
  }): VolunteerTask[] {
    const dbData = db.getData();
    let tasks = [...dbData.tasks];

    if (filters?.availableOnly) {
      tasks = tasks.filter((t) => t.status === 'AVAILABLE');
    } else if (filters?.status) {
      tasks = tasks.filter((t) => t.status === filters.status);
    }

    if (filters?.volunteerId) {
      tasks = tasks.filter((t) => t.volunteerId === filters.volunteerId);
    }

    return tasks;
  }

  public static getTaskById(taskId: string): VolunteerTask {
    const dbData = db.getData();
    const task = dbData.tasks.find((t) => t.id === taskId);

    if (!task) {
      throw { statusCode: 404, message: 'Volunteer task not found.' };
    }

    return task;
  }

  public static acceptTask(taskId: string, volunteer: User): VolunteerTask {
    const dbData = db.getData();
    const task = dbData.tasks.find((t) => t.id === taskId);

    if (!task) {
      throw { statusCode: 404, message: 'Volunteer task not found.' };
    }

    if (task.status !== 'AVAILABLE') {
      throw { statusCode: 400, message: `Task is no longer available (Current Status: ${task.status}).` };
    }

    const now = new Date().toISOString();
    task.status = 'ACCEPTED';
    task.volunteerId = volunteer.id;
    task.volunteerName = volunteer.name;
    task.volunteerPhone = volunteer.phone;
    task.acceptedAt = now;

    db.save();

    AuditService.log({
      action: 'DELIVERY_ACCEPTED',
      actorId: volunteer.id,
      actorName: volunteer.name,
      actorRole: volunteer.role,
      targetType: 'TASK',
      targetId: task.id,
      details: `Accepted delivery task for "${task.listingTitle}".`,
    });

    return task;
  }

  public static updateTaskStatus(
    taskId: string,
    newStatus: VolunteerTaskStatus,
    volunteer: User,
    inputClaimCode?: string
  ): VolunteerTask {
    const dbData = db.getData();
    const task = dbData.tasks.find((t) => t.id === taskId);

    if (!task) {
      throw { statusCode: 404, message: 'Volunteer task not found.' };
    }

    if (volunteer.role !== 'ADMIN' && task.volunteerId !== volunteer.id) {
      throw { statusCode: 403, message: 'You are not assigned to this volunteer task.' };
    }

    const now = new Date().toISOString();

    // Validate Status Lifecycle Transition
    const validTransitions: Record<VolunteerTaskStatus, VolunteerTaskStatus[]> = {
      AVAILABLE: ['ACCEPTED', 'CANCELLED'],
      ACCEPTED: ['PICKUP_IN_PROGRESS', 'CANCELLED'],
      PICKUP_IN_PROGRESS: ['PICKED_UP', 'CANCELLED'],
      PICKED_UP: ['DELIVERY_IN_PROGRESS', 'CANCELLED'],
      DELIVERY_IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    const allowed = validTransitions[task.status] || [];
    if (!allowed.includes(newStatus)) {
      throw {
        statusCode: 400,
        message: `Invalid status transition from "${task.status}" to "${newStatus}".`,
      };
    }

    // Update status and timestamp
    task.status = newStatus;

    if (newStatus === 'PICKUP_IN_PROGRESS') {
      task.pickupStartedAt = now;
      AuditService.log({
        action: 'PICKUP_STARTED',
        actorId: volunteer.id,
        actorName: volunteer.name,
        actorRole: volunteer.role,
        targetType: 'TASK',
        targetId: task.id,
        details: `Started pickup for "${task.listingTitle}".`,
      });
    } else if (newStatus === 'PICKED_UP') {
      task.pickedUpAt = now;
      AuditService.log({
        action: 'FOOD_PICKED_UP',
        actorId: volunteer.id,
        actorName: volunteer.name,
        actorRole: volunteer.role,
        targetType: 'TASK',
        targetId: task.id,
        details: `Picked up food from donor "${task.donorName}".`,
      });
    } else if (newStatus === 'DELIVERY_IN_PROGRESS') {
      task.deliveryStartedAt = now;
    } else if (newStatus === 'COMPLETED') {
      // Optional check claim code
      if (inputClaimCode && inputClaimCode.trim().toUpperCase() !== task.claimCode.toUpperCase()) {
        throw { statusCode: 400, message: 'Invalid verification claim code provided.' };
      }

      task.completedAt = now;

      // Update associated food listing to COMPLETED!
      const listing = dbData.listings.find((l) => l.id === task.listingId);
      if (listing) {
        listing.status = 'COMPLETED';
      }

      AuditService.log({
        action: 'DELIVERY_COMPLETED',
        actorId: volunteer.id,
        actorName: volunteer.name,
        actorRole: volunteer.role,
        targetType: 'TASK',
        targetId: task.id,
        details: `Successfully completed delivery to "${task.receiverName}". Verification code verified.`,
      });

      AuditService.log({
        action: 'LISTING_COMPLETED',
        actorId: volunteer.id,
        actorName: volunteer.name,
        actorRole: volunteer.role,
        targetType: 'LISTING',
        targetId: task.listingId,
        details: `Listing status updated to COMPLETED.`,
      });
    }

    db.save();
    return task;
  }
}
