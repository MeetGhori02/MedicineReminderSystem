import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// ─── Token generator ──────────────────────────────────────────────────────────
const generateToken = (userId: number, email: string, role: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');

  return jwt.sign(
    { id: userId, email, role },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
};

// ─── Register user ─────────────────────────────────────────────────────────────
export const registerUser = async (input: RegisterInput) => {
  const { name, email, password } = input;

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('Email already registered');
  }

  // Hash password with salt rounds = 12
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const token = generateToken(user.id, user.email, user.role);

  return { user, token };
};

// ─── Login user ────────────────────────────────────────────────────────────────
export const loginUser = async (input: LoginInput) => {
  const { email, password } = input;

  // Find user by email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user.id, user.email, user.role);

  // Return user without password
  const { password: _pwd, ...safeUser } = user;
  void _pwd; // suppress unused variable warning

  return { user: safeUser, token };
};

// ─── Get user profile ──────────────────────────────────────────────────────────
export const getUserProfile = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { medicines: true } },
    },
  });

  if (!user) throw new Error('User not found');
  return user;
};
