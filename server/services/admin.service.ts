import { db } from '../db/jsonDb';
import { PlatformStats, User, SystemSettings } from '../../src/types';
import { AuditService } from './audit.service';

export class AdminService {
  public static getStats(): PlatformStats {
    db.autoCheckExpiration();
    const dbData = db.getData();

    const totalUsers = dbData.users.length;
    const totalDonors = dbData.users.filter((u) => u.role === 'DONOR').length;
    const totalReceivers = dbData.users.filter((u) => u.role === 'RECEIVER').length;
    const totalVolunteers = dbData.users.filter((u) => u.role === 'VOLUNTEER').length;

    const activeListings = dbData.listings.filter((l) => l.status === 'ACTIVE').length;
    const claimedListings = dbData.listings.filter((l) => l.status === 'CLAIMED').length;
    const completedDeliveries = dbData.listings.filter((l) => l.status === 'COMPLETED').length;
    const expiredListings = dbData.listings.filter((l) => l.status === 'EXPIRED').length;

    const totalServingsSaved = dbData.listings
      .filter((l) => l.status === 'CLAIMED' || l.status === 'COMPLETED')
      .reduce((sum, l) => sum + l.quantityServings, 0);

    const estimatedKgSaved = Math.round(totalServingsSaved * 0.35 * 10) / 10;
    const pendingVerifications = dbData.users.filter((u) => !u.isVerified).length;

    return {
      totalUsers,
      totalDonors,
      totalReceivers,
      totalVolunteers,
      activeListings,
      claimedListings,
      completedDeliveries,
      expiredListings,
      totalServingsSaved,
      estimatedKgSaved,
      pendingVerifications,
    };
  }

  public static getUsers(filters?: { role?: string; status?: string; search?: string }): User[] {
    const dbData = db.getData();
    let users = dbData.users.map(({ passwordHash, ...clean }) => clean);

    if (filters?.role) {
      users = users.filter((u) => u.role === filters.role);
    }
    if (filters?.status) {
      users = users.filter((u) => u.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.organization && u.organization.toLowerCase().includes(q)) ||
          u.city.toLowerCase().includes(q)
      );
    }

    return users;
  }

  public static toggleVerifyUser(userId: string, adminUser: User): User {
    const dbData = db.getData();
    const user = dbData.users.find((u) => u.id === userId);

    if (!user) {
      throw { statusCode: 404, message: 'User not found.' };
    }

    user.isVerified = !user.isVerified;
    db.save();

    AuditService.log({
      action: 'USER_VERIFIED',
      actorId: adminUser.id,
      actorName: adminUser.name,
      actorRole: adminUser.role,
      targetType: 'USER',
      targetId: user.id,
      details: `${user.isVerified ? 'Verified' : 'Unverified'} user account for ${user.name} (${user.email}).`,
    });

    const { passwordHash, ...clean } = user;
    return clean;
  }

  public static toggleSuspendUser(userId: string, adminUser: User): User {
    const dbData = db.getData();
    const user = dbData.users.find((u) => u.id === userId);

    if (!user) {
      throw { statusCode: 404, message: 'User not found.' };
    }

    if (user.role === 'ADMIN') {
      throw { statusCode: 400, message: 'Cannot suspend an Administrator account.' };
    }

    user.status = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    db.save();

    AuditService.log({
      action: 'USER_SUSPENDED',
      actorId: adminUser.id,
      actorName: adminUser.name,
      actorRole: adminUser.role,
      targetType: 'USER',
      targetId: user.id,
      details: `${user.status === 'SUSPENDED' ? 'Suspended' : 'Reactivated'} user account for ${user.name}.`,
    });

    const { passwordHash, ...clean } = user;
    return clean;
  }

  public static getSettings(): SystemSettings {
    return db.getData().settings;
  }

  public static updateSettings(newSettings: Partial<SystemSettings>, adminUser: User): SystemSettings {
    const dbData = db.getData();
    dbData.settings = { ...dbData.settings, ...newSettings };
    db.save();

    AuditService.log({
      action: 'SYSTEM_SETTINGS_UPDATED',
      actorId: adminUser.id,
      actorName: adminUser.name,
      actorRole: adminUser.role,
      targetType: 'SETTINGS',
      targetId: 'system_settings',
      details: 'Updated platform system configuration parameters.',
    });

    return dbData.settings;
  }
}
