import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';

/**
 * Generates a signed JWT token containing user identity and role.
 * Expires in 7 days.
 */
function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password must be at least 6 characters.',
      });
    }

    // Check if email is already taken
    const existing = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        status: 'fail',
        message: 'An account with this email already exists. Please log in.',
      });
    }

    // Role is ALWAYS "customer" from the public register endpoint.
    // Admin accounts can only be created via server/createAdmin.js script.
    const user = await UserModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'customer',
    });

    const token = signToken(user);

    return res.status(201).json({
      status: 'success',
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[Auth] Register error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Registration failed. Please try again.',
    });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password.',
      });
    }

    // Explicitly select password because it has `select: false` in the schema
    const user = await UserModel.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password.',
      });
    }

    const token = signToken(user);

    return res.status(200).json({
      status: 'success',
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Login failed. Please try again.',
    });
  }
};

// GET /api/auth/me  (requires protect middleware)
export const getMe = async (req, res) => {
  try {
    // req.user is populated by the protect middleware
    const user = await UserModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      status: 'success',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[Auth] GetMe error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user profile.',
    });
  }
};
