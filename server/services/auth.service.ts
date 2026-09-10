import { db, DBUser } from '../db/jsonDb';
import { hashPassword, comparePassword, generateToken, generateId } from '../utils/helpers';
import { User, UserRole } from '../../src/types';
import { AuditService } from './audit.service';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  organization?: string;
  city: string;
}

export class AuthService {
  public static async register(input: RegisterInput): Promise<{ user: User; token: string }> {
    const dbData = db.getData();
    const existing = dbData.users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());

    if (existing) {
      throw { statusCode: 400, message: 'An account with this email address already exists.' };
    }

    const passwordHash = await hashPassword(input.password);
    const newUser: DBUser = {
      id: generateId('usr'),
      name: input.name.trim(),
      email: input.email.toLowerCase().trim(),
      role: input.role,
      phone: input.phone.trim(),
      organization: input.organization ? input.organization.trim() : undefined,
      city: input.city.trim(),
      isVerified: input.role === 'DONOR' || input.role === 'ADMIN', // Auto-verify donors & admin for convenience, receivers/volunteers get auto or manual verification
      status: 'ACTIVE',
      joinedAt: new Date().toISOString(),
      passwordHash,
    };

    dbData.users.push(newUser);
    db.save();

    AuditService.log({
      action: 'USER_REGISTERED',
      actorId: newUser.id,
      actorName: newUser.name,
      actorRole: newUser.role,
      targetType: 'USER',
      targetId: newUser.id,
      details: `New user registered as ${newUser.role} in ${newUser.city}.`,
    });

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const { passwordHash: _, ...cleanUser } = newUser;
    return { user: cleanUser, token };
  }

  public static async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const dbData = db.getData();
    const user = dbData.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) {
      throw { statusCode: 401, message: 'Invalid email or password credentials.' };
    }

    if (user.status === 'SUSPENDED') {
      throw { statusCode: 403, message: 'Account is suspended. Please contact platform administration.' };
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw { statusCode: 401, message: 'Invalid email or password credentials.' };
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { passwordHash: _, ...cleanUser } = user;
    return { user: cleanUser, token };
  }

  public static getUserById(userId: string): User {
    const dbData = db.getData();
    const user = dbData.users.find((u) => u.id === userId);

    if (!user) {
      throw { statusCode: 404, message: 'User not found.' };
    }

    const { passwordHash, ...cleanUser } = user;
    return cleanUser;
  }
}
