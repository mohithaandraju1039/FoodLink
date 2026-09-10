import fs from 'fs';
import path from 'path';
import { CONFIG } from '../config';
import { User, FoodListing, VolunteerTask, AuditLog, SystemSettings } from '../../src/types';

export interface DBUser extends User {
  passwordHash: string;
}

export interface Schema {
  users: DBUser[];
  listings: FoodListing[];
  tasks: VolunteerTask[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
}

const defaultSettings: SystemSettings = {
  platformName: 'FoodLink Platform',
  autoExpireHours: 24,
  hygieneDeclarationMandatory: true,
  allowDirectReceiverPickup: false,
  announcementBanner: 'Welcome to FoodLink! Zero Food Waste, Zero Hunger.',
  contactSupportEmail: 'support@foodlink.org',
};

const defaultSchema: Schema = {
  users: [],
  listings: [],
  tasks: [],
  auditLogs: [],
  settings: defaultSettings,
};

class JSONDatabase {
  private dbPath: string;
  private memoryData: Schema;

  constructor() {
    this.dbPath = CONFIG.DB_FILE_PATH;
    this.memoryData = { ...defaultSchema };
    this.ensureDirectory();
    this.load();
  }

  private ensureDirectory() {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  public load(): Schema {
    try {
      if (fs.existsSync(this.dbPath)) {
        const fileContent = fs.readFileSync(this.dbPath, 'utf-8');
        if (fileContent.trim()) {
          const parsed = JSON.parse(fileContent);
          this.memoryData = {
            users: parsed.users || [],
            listings: parsed.listings || [],
            tasks: parsed.tasks || [],
            auditLogs: parsed.auditLogs || [],
            settings: { ...defaultSettings, ...(parsed.settings || {}) },
          };
          return this.memoryData;
        }
      }
    } catch (err) {
      console.error('Error loading database, falling back to default:', err);
    }
    this.memoryData = { ...defaultSchema };
    this.save();
    return this.memoryData;
  }

  public save(): void {
    try {
      this.ensureDirectory();
      const content = JSON.stringify(this.memoryData, null, 2);
      try {
        const tempPath = `${this.dbPath}.tmp`;
        fs.writeFileSync(tempPath, content, 'utf-8');
        fs.renameSync(tempPath, this.dbPath);
      } catch (e) {
        // Fallback for Windows file lock permission collisions
        fs.writeFileSync(this.dbPath, content, 'utf-8');
      }
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  public getData(): Schema {
    return this.memoryData;
  }

  // --- Helpers ---
  public autoCheckExpiration(): number {
    const now = new Date();
    let expiredCount = 0;
    this.memoryData.listings.forEach(listing => {
      if (listing.status === 'ACTIVE') {
        const expiry = new Date(listing.expiresAt);
        if (expiry <= now) {
          listing.status = 'EXPIRED';
          expiredCount++;
          // Add audit log
          this.memoryData.auditLogs.unshift({
            id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            timestamp: new Date().toISOString(),
            action: 'LISTING_EXPIRED',
            actorId: 'system',
            actorName: 'System Expiry Engine',
            actorRole: 'ADMIN',
            targetType: 'LISTING',
            targetId: listing.id,
            details: `Listing "${listing.title}" expired automatically based on expiry timestamp (${listing.expiresAt})`,
            status: 'SUCCESS',
          });
        }
      }
    });

    if (expiredCount > 0) {
      this.save();
    }
    return expiredCount;
  }
}

export const db = new JSONDatabase();
