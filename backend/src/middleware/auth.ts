import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendUnauthorized } from '../utils/response';

// Extend Express Request to include authenticated user
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

// JWT payload shape
interface JwtPayload {
  id: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// ─── Protect routes: verify JWT token ─────────────────────────────────────────
export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendUnauthorized(res, 'No token provided. Please login.');
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    // Verify and decode token
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      sendUnauthorized(res, 'Token expired. Please login again.');
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      sendUnauthorized(res, 'Invalid token. Please login again.');
      return;
    }
    sendUnauthorized(res, 'Authentication failed.');
  }
};

// ─── Admin-only guard ──────────────────────────────────────────────────────────
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ success: false, message: 'Admin access required' });
    return;
  }
  next();
};
