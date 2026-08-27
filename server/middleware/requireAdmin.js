/**
 * requireAdmin Middleware
 *
 * Must be used AFTER the `protect` middleware — it assumes req.user is already set.
 * Returns 403 Forbidden if the authenticated user does not have role "admin".
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'fail',
      message: 'Access denied. Administrator privileges required.',
    });
  }
  next();
};
