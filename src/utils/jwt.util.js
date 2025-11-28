import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

export const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  // Use different secrets based on role
  const isAdmin = user.role === 'admin';
  
  const accessTokenSecret = isAdmin 
    ? config.jwt.adminAccessTokenSecret 
    : config.jwt.accessTokenSecret;
    
  const refreshTokenSecret = isAdmin
    ? config.jwt.adminRefreshTokenSecret
    : config.jwt.refreshTokenSecret;

  const accessToken = jwt.sign(
    payload,
    accessTokenSecret,
    { expiresIn: config.jwt.accessTokenExpiry }
  );

  const refreshToken = jwt.sign(
    { id: user.id, role: user.role },
    refreshTokenSecret,
    { expiresIn: config.jwt.refreshTokenExpiry }
  );

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token, role) => {
  try {
    const secret = role === 'admin' 
      ? config.jwt.adminAccessTokenSecret 
      : config.jwt.accessTokenSecret;
    
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token, role) => {
  try {
    const secret = role === 'admin'
      ? config.jwt.adminRefreshTokenSecret
      : config.jwt.refreshTokenSecret;
    
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};
