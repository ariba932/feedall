import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';
import { AppError } from '@/middleware/error';
import { authenticate } from '@/middleware/auth';
import { AuthenticatedUser } from '@/types/auth';

const router = Router();

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const data = userSchema.parse(req.body);
  // TODO: Implement user registration
  res.status(201).json({ message: 'User registered successfully' });
}));

router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const data = userSchema.parse(req.body);
  // TODO: Implement user login
  res.json({ message: 'Login successful' });
}));

// Add authenticate middleware to protected routes
router.get('/me', authenticate, asyncHandler(async (req: Request, res: Response) => {
  // TypeScript should now recognize req.user because of authenticate middleware
  if (!req.user) {
    throw new AppError(401, 'Not authenticated');
  }
  res.json(req.user);
}));

export default router;
