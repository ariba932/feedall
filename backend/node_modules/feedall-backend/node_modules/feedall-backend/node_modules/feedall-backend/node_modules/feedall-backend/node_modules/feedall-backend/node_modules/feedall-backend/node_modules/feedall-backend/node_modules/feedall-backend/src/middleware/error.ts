import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  console.error('Error:', err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation error',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code,
      })),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      errors: err.errors,
    });
  }

  // Handle Ethereum/Web3 specific errors
  if (err.code === 'INVALID_ARGUMENT' || err.code === 'UNPREDICTABLE_GAS_LIMIT') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid blockchain transaction parameters',
      error: err.reason || err.message,
    });
  }

  if (err.code === 'NETWORK_ERROR') {
    return res.status(503).json({
      status: 'error',
      message: 'Blockchain network error',
      error: err.message,
    });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
