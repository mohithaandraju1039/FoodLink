import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/helpers';
import { db } from '../db/jsonDb';
import { User } from '../../src/types';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    const dbData = db.getData();
    const foundUser = dbData.users.find((u) => u.id === payload.userId);

    if (!foundUser) {
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }

    if (foundUser.status === 'SUSPENDED') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended by an administrator.' });
    }

    // Strip passwordHash before attaching
    const { passwordHash, ...userClean } = foundUser;
    req.user = userClean;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};
