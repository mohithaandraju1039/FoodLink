import { db } from '../db/jsonDb';
import { AuditAction, AuditLog, UserRole } from '../../src/types';
import { generateId } from '../utils/helpers';

export interface CreateAuditInput {
  action: AuditAction;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  targetType: string;
  targetId: string;
  details: string;
  status?: 'SUCCESS' | 'FAILURE';
}

export class AuditService {
  public static log(input: CreateAuditInput): AuditLog {
    const logItem: AuditLog = {
      id: generateId('log'),
      timestamp: new Date().toISOString(),
      action: input.action,
      actorId: input.actorId,
      actorName: input.actorName,
      actorRole: input.actorRole,
      targetType: input.targetType,
      targetId: input.targetId,
      details: input.details,
      status: input.status || 'SUCCESS',
    };

    const dbData = db.getData();
    dbData.auditLogs.unshift(logItem);
    db.save();
    return logItem;
  }

  public static getLogs(filters?: {
    action?: string;
    actorRole?: string;
    search?: string;
    limit?: number;
  }): AuditLog[] {
    const dbData = db.getData();
    let logs = [...dbData.auditLogs];

    if (filters?.action) {
      logs = logs.filter((l) => l.action === filters.action);
    }
    if (filters?.actorRole) {
      logs = logs.filter((l) => l.actorRole === filters.actorRole);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.actorName.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q)
      );
    }

    if (filters?.limit) {
      logs = logs.slice(0, filters.limit);
    }

    return logs;
  }
}
