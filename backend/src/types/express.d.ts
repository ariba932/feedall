import { AuthenticatedUser } from './auth';

declare global {
  namespace Express {
    export interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
