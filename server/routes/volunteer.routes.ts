import { Router, Response } from 'express';
import { VolunteerService } from '../services/volunteer.service';
import { authenticateJWT, AuthenticatedRequest } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

// GET /api/volunteer/tasks
router.get('/tasks', authenticateJWT, requireRole('VOLUNTEER', 'ADMIN'), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { status, volunteerId, availableOnly } = req.query;
    const tasks = VolunteerService.getTasks({
      status: status as string,
      volunteerId: volunteerId as string,
      availableOnly: availableOnly === 'true',
    });
    return res.json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
});

// GET /api/volunteer/tasks/:id
router.get('/tasks/:id', authenticateJWT, requireRole('VOLUNTEER', 'ADMIN'), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const task = VolunteerService.getTaskById(req.params.id);
    return res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
});

// POST /api/volunteer/tasks/:id/accept
router.post('/tasks/:id/accept', authenticateJWT, requireRole('VOLUNTEER', 'ADMIN'), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const task = VolunteerService.acceptTask(req.params.id, req.user!);
    return res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/volunteer/tasks/:id/status
router.patch('/tasks/:id/status', authenticateJWT, requireRole('VOLUNTEER', 'ADMIN'), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { status, claimCode } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    const task = VolunteerService.updateTaskStatus(req.params.id, status, req.user!, claimCode);
    return res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
});

export default router;
