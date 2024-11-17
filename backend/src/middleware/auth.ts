import { RequestHandler } from 'express';
import { AppError } from './error';

export const authenticate: RequestHandler = (req, _res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    throw new AppError(401, 'No token provided');
  }

  try {
    // TODO: Implement JWT verification
    req.user = {
      id: '1',
      email: 'user@example.com'
    };
    next();
  } catch (error) {
    throw new AppError(401, 'Invalid token');
  }
};
