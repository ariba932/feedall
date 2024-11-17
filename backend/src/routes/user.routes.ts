import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';
import { AppError } from '@/middleware/error';

const router = Router();

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post('/register', asyncHandler(async (req, res) => {
  const data = userSchema.parse(req.body);
  // TODO: Implement user registration
  res.status(201).json({ message: 'User registered successfully' });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const data = userSchema.parse(req.body);
  // TODO: Implement user login
  res.json({ message: 'Login successful' });
}));

router.get('/me', asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError(401, 'Not authenticated');
  }
  res.json(req.user);
}));

export default router;
