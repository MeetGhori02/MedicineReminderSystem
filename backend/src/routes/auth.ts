import { Router, Request, Response } from 'express';
import { registerUser, loginUser, getUserProfile } from '../services/authService';
import { protect, AuthRequest } from '../middleware/auth';
import { sendSuccess, sendCreated, sendError, sendServerError } from '../utils/response';

export const authRouter = Router();

// ─── POST /api/auth/register ───────────────────────────────────────────────────
authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      sendError(res, 'Name, email and password are required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      sendError(res, 'Invalid email format');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      sendError(res, 'Password must be at least 6 characters');
      return;
    }

    const result = await registerUser({ name: name.trim(), email: email.toLowerCase(), password });
    sendCreated(res, result, 'Account created successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    if (message === 'Email already registered') {
      sendError(res, message, 409);
      return;
    }
    sendServerError(res, message);
  }
});

// ─── POST /api/auth/login ──────────────────────────────────────────────────────
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(res, 'Email and password are required');
      return;
    }

    const result = await loginUser({
      email: email.toLowerCase(),
      password,
    });

    sendSuccess(res, result, 'Login successful');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    sendError(res, message, 401);
  }
});

// ─── GET /api/auth/me (protected) ─────────────────────────────────────────────
authRouter.get('/me', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await getUserProfile(req.user!.id);
    sendSuccess(res, profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch profile';
    sendServerError(res, message);
  }
});
