import { RequestHandler } from 'express';
import { AppError } from './error';
import { UserRole, UserStatus } from '@prisma/client';
import { AuthenticatedUser } from '../types/auth';

export const authenticate: RequestHandler = (req, _res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    throw new AppError(401, 'No token provided');
  }

  try {
    // TODO: Implement JWT verification
    const user: AuthenticatedUser = {
      id: '1',
      email: 'user@example.com',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE
    };
    
    req.user = user;
    next();
  } catch (error) {
    throw new AppError(401, 'Invalid token');
  }
};
