import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors';
import User from '../models/User.model';

/**
 * Middleware to check if user is an admin
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const userId = (req.user as any).userId || (req.user as any)._id;
    const user = await User.findById(userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (user.role !== 'admin') {
      throw new UnauthorizedError('Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has specific permission
 */
export const requirePermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const userId = (req.user as any).userId || (req.user as any)._id;
      const user = await User.findById(userId);

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      // Admins have all permissions
      if (user.role === 'admin') {
        return next();
      }

      // Check if user has the specific permission
      if (!user.permissions || !user.permissions.includes(permission)) {
        throw new UnauthorizedError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has any of the specified roles
 */
export const requireRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const userId = (req.user as any).userId || (req.user as any)._id;
      const user = await User.findById(userId);

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      if (!roles.includes(user.role)) {
        throw new UnauthorizedError('Insufficient role permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
