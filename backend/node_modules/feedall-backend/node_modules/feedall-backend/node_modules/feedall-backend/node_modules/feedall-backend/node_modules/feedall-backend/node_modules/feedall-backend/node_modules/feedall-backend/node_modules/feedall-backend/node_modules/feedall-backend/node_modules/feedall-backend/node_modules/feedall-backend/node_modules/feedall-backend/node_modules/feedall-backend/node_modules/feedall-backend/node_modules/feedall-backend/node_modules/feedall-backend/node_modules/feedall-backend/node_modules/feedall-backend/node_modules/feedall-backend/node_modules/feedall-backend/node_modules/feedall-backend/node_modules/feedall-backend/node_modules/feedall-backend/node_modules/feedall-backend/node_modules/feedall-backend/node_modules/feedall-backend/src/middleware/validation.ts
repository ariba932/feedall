import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from './error';

interface ValidationConfig {
  params?: AnyZodObject;
  query?: AnyZodObject;
  body?: AnyZodObject;
}

export const validateRequest = (schemas: ValidationConfig) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new AppError(
            400,
            'Validation Error',
            error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            }))
          )
        );
      } else {
        next(error);
      }
    }
  };
};
