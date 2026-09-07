const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - ensure user is authenticated
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vastraa_secret_key_12345!');

      // Get user from the token, exclude password
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      if (req.user.isBlocked) {
        return res.status(403).json({ success: false, message: 'Your account has been suspended' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

// Authorize roles - e.g., admin, sub-admin
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'none'}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Check specific permission for sub-admins / admins
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    
    // Admins bypass all permission checks
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Sub-admins must have the specific permission
    if (req.user.role === 'sub-admin' && req.user.permissions.includes(permission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `You do not have permission to perform this action (${permission})`
    });
  };
};

module.exports = { protect, authorize, checkPermission };
