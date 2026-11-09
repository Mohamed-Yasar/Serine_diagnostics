import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// ========================================
// JWT PAYLOAD TYPE
// ========================================

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// ========================================
// AUTHENTICATE TOKEN
// ========================================

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    // Expected format:
    // Authorization: Bearer <token>

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is required',
      });
    }

    // Extract token
    const [type, token] = authHeader.split(' ');

    // Validate Bearer format
    if (type !== 'Bearer' || !token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token format',
      });
    }

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');

      return res.status(500).json({
        success: false,
        message: 'Server authentication configuration error',
      });
    }

    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    ) as AuthenticatedUser;

    // Attach authenticated user to request
    req.user = decoded;

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token',
    });
  }
}

// ========================================
// ROLE AUTHORIZATION
// ========================================

export function authorizeRoles(...allowedRoles: string[]) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }

    next();
  };
}