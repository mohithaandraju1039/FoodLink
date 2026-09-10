import { Router, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { authenticateJWT, AuthenticatedRequest } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

// Protect all admin routes with JWT and ADMIN role
router.use(authenticateJWT, requireRole('ADMIN'));

// GET /api/admin/stats
router.get('/stats', (req, res, next) => {
  try {
    const stats = AdminService.getStats();
    return res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users
router.get('/users', (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const users = AdminService.getUsers({
      role: role as string,
      status: status as string,
      search: search as string,
    });
    return res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/users/:id/verify
router.patch('/users/:id/verify', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const user = AdminService.toggleVerifyUser(req.params.id, req.user!);
    return res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/users/:id/suspend
router.patch('/users/:id/suspend', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const user = AdminService.toggleSuspendUser(req.params.id, req.user!);
    return res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/settings
router.get('/settings', (req, res, next) => {
  try {
    const settings = AdminService.getSettings();
    return res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/settings
router.patch('/settings', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const settings = AdminService.updateSettings(req.body, req.user!);
    return res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
});

export default router;
