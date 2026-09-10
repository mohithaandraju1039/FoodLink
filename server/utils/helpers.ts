import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CONFIG } from '../config';
import { UserRole } from '../../src/types';

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, CONFIG.BCRYPT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, CONFIG.JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, CONFIG.JWT_SECRET) as TokenPayload;
};

export const generateClaimCode = (): string => {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `FL-CLM-${randomDigits}`;
};

export const generateId = (prefix: string = 'id'): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7);
  return `${prefix}_${timestamp}_${randomStr}`;
};
