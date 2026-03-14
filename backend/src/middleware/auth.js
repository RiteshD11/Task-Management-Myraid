const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');

const protect = async (req, res, next) => {
  try {
    // Get token from HTTP-only cookie
    const token = req.cookies.token;

    if (!token) {
      return sendError(res, 401, 'Not authenticated. Please log in.');
    }

    // Verify token
    const decoded = verifyToken(token);

    // Attach user to request
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return sendError(res, 401, 'User no longer exists.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 401, 'Invalid token.');
    }
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token expired. Please log in again.');
    }
    return sendError(res, 500, 'Authentication error.');
  }
};

module.exports = { protect };
