import { Router, Response } from 'express';
import { ClaimService } from '../services/claim.service';
import { authenticateJWT, AuthenticatedRequest } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

// POST /api/claims (RECEIVER or ADMIN)
router.post('/', authenticateJWT, requireRole('RECEIVER', 'ADMIN'), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { listingId, estimatedPickupTime, claimNotes, deliveryAddressOverride } = req.body;
    if (!listingId) {
      return res.status(400).json({ success: false, message: 'listingId is required.' });
    }

    const result = ClaimService.claimFood(
      { listingId, estimatedPickupTime, claimNotes, deliveryAddressOverride },
      req.user!
    );
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// GET /api/claims/my (Strict RECEIVER isolation)
router.get('/my', authenticateJWT, requireRole('RECEIVER', 'ADMIN'), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const receiverId = req.user!.id;
    const claims = ClaimService.getReceiverClaims(receiverId);
    return res.json({ success: true, data: claims });
  } catch (err) {
    next(err);
  }
});

export default router;
