import { Router, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { authenticateJWT, AuthenticatedRequest } from '../middlewares/auth.middleware';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role, phone, organization, city } = req.body;
    if (!name || !email || !password || !role || !phone || !city) {
      return res.status(400).json({ success: false, message: 'All required registration fields must be provided.' });
    }

    if (role === 'ADMIN') {
      return res.status(400).json({ success: false, message: 'Admin accounts cannot be created through public registration.' });
    }

    const result = await AuthService.register({
      name,
      email,
      password,
      role,
      phone,
      organization,
      city,
    });

    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const result = await AuthService.login(email, password);
    return res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  return res.json({ success: true, data: req.user });
});

export default router;
