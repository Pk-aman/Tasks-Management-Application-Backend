import { verifyAccessToken } from '../utils/jwt.util.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token is required' 
    });
  }

  try {
    // Try to decode to get role
    const decoded = verifyAccessToken(token, 'user');
    req.user = decoded;
    next();
  } catch (error) {
    try {
      // Try admin token
      const decoded = verifyAccessToken(token, 'admin');
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired access token' 
      });
    }
  }
};

export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Insufficient permissions' 
      });
    }

    next();
  };
};
