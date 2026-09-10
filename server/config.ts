import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'foodlink_super_secret_jwt_key_2026_production_quality',
  JWT_EXPIRES_IN: '7d',
  DB_FILE_PATH: path.join(__dirname, '../../data/foodlink_db.json'),
  BCRYPT_ROUNDS: 10,
};
