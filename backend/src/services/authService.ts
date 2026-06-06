import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Medicine from '../models/Medicine';

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

type UserRole = 'USER' | 'ADMIN';

const toUserDto = (user: any) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  _count: user._count,
});

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
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error('Email already registered');
  }

  // Hash password with salt rounds = 12
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const token = generateToken(user._id, user.email, user.role as UserRole);

  return { user: toUserDto(user), token };
};

// ─── Login user ────────────────────────────────────────────────────────────────
export const loginUser = async (input: LoginInput) => {
  const { email, password } = input;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user._id, user.email, user.role as UserRole);

  return { user: toUserDto(user), token };
};

// ─── Get user profile ──────────────────────────────────────────────────────────
export const getUserProfile = async (userId: number) => {
  const user = await User.findById(userId).lean();

  if (!user) throw new Error('User not found');

  const medicines = await Medicine.countDocuments({ userId });
  return toUserDto({ ...user, _count: { medicines } });
};
