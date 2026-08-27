import jwt from 'jsonwebtoken';

/**
 * Authentication Middleware
 *
 * Reads and verifies a JWT from the "Authorization: Bearer <token>" header.
 * On success: attaches { id, email, role } to req.user and calls next().
 * On failure: returns 401 Unauthorized immediately.
 *
 * Works identically in both:
 * - Local Express server (server/server.js)
 * - Vercel serverless functions (api/index.js)
 * because JWT is stateless — no server-side session storage required.
 */
export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'fail',
      message: 'Access denied. No token provided. Please log in.',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Access denied. Malformed authorization header.',
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ [Auth] JWT_SECRET is not set in environment variables!');
      return res.status(500).json({
        status: 'error',
        message: 'Server authentication configuration error.',
      });
    }

    const decoded = jwt.verify(token, jwtSecret);
    // Attach decoded payload to request — controllers can read req.user
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Session expired. Please log in again.',
      });
    }
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid token. Please log in again.',
    });
  }
};
