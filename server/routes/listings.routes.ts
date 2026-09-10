import { Router, Response } from 'express';
import { ListingService } from '../services/listing.service';
import { authenticateJWT, AuthenticatedRequest } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

// GET /api/listings
router.get('/', (req, res, next) => {
  try {
    const { status, category, city, search, donorId, claimedByReceiverId } = req.query;
    const listings = ListingService.getListings({
      status: status as string,
      category: category as string,
      city: city as string,
      search: search as string,
      donorId: donorId as string,
      claimedByReceiverId: claimedByReceiverId as string,
    });
    return res.json({ success: true, data: listings });
  } catch (err) {
    next(err);
  }
});

// GET /api/listings/:id
router.get('/:id', (req, res, next) => {
  try {
    const listing = ListingService.getListingById(req.params.id);
    return res.json({ success: true, data: listing });
  } catch (err) {
    next(err);
  }
});

// POST /api/listings (DONOR or ADMIN)
router.post('/', authenticateJWT, requireRole('DONOR', 'ADMIN'), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const listing = ListingService.createListing(req.body, req.user!);
    return res.status(201).json({ success: true, data: listing });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/listings/:id/cancel (DONOR or ADMIN)
router.patch('/:id/cancel', authenticateJWT, requireRole('DONOR', 'ADMIN'), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const listing = ListingService.cancelListing(req.params.id, req.user!);
    return res.json({ success: true, data: listing });
  } catch (err) {
    next(err);
  }
});

export default router;
