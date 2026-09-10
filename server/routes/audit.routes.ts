import { Router, Response } from 'express';
import { AuditService } from '../services/audit.service';
import { authenticateJWT, AuthenticatedRequest } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

// GET /api/audit-logs (ADMIN only)
router.get('/', authenticateJWT, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { action, actorRole, search, limit } = req.query;
    const logs = AuditService.getLogs({
      action: action as string,
      actorRole: actorRole as string,
      search: search as string,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });
    return res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
});

export default router;
