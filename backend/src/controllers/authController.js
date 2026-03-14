const { body } = require('express-validator');
const User = require('../models/User');
const { generateToken, setTokenCookie, clearTokenCookie } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/response');

// Validation rules
const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/\d/)
    .withMessage('Password must contain a number'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 409, 'Email already registered');
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    return sendSuccess(res, 201, 'Registration successful', {
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    return sendSuccess(res, 200, 'Login successful', {
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
const logout = (req, res) => {
  clearTokenCookie(res);
  return sendSuccess(res, 200, 'Logged out successfully');
};

// GET /api/auth/me
const getMe = (req, res) => {
  return sendSuccess(res, 200, 'User fetched', {
    user: { id: req.user._id, name: req.user.name, email: req.user.email },
  });
};

module.exports = { register, login, logout, getMe, registerValidation, loginValidation };
