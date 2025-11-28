import { authService } from '../services/auth.service.js';
import { validateEmail, validatePassword, validateOTP } from '../utils/validators.js';

export const authController = {
  // Send OTP for signup
  async sendSignupOTP(req, res, next) {
    try {
      const { email } = req.body;

      if (!email || !validateEmail(email)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Valid email is required' 
        });
      }

      const result = await authService.sendSignupOTP(email);
      
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  // Signup
  async signup(req, res, next) {
    try {
      const { name, email, password, otp } = req.body;

      if (!name || !email || !password || !otp) {
        return res.status(400).json({ 
          success: false, 
          message: 'All fields are required' 
        });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid email format' 
        });
      }

      if (!validatePassword(password)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Password must be at least 6 characters' 
        });
      }

      if (!validateOTP(otp)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid OTP format' 
        });
      }

      const result = await authService.signup(name, email, password, otp);
      
      res.status(201).json({
        success: true,
        ...result,
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  },

  // Login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email and password are required' 
        });
      }

      const result = await authService.login(email, password);

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        success: true,
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error) {
      res.status(401).json({ 
        success: false, 
        message: error.message 
      });
    }
  },

  // Refresh token
  async refreshToken(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      const result = await authService.refreshAccessToken(refreshToken);

      // Update refresh token cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error) {
      res.status(403).json({ 
        success: false, 
        message: error.message 
      });
    }
  },

  // Send password reset OTP
  async sendPasswordResetOTP(req, res, next) {
    try {
      const { email } = req.body;

      if (!email || !validateEmail(email)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Valid email is required' 
        });
      }

      const result = await authService.sendPasswordResetOTP(email);
      
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  },

  // Reset password
  async resetPassword(req, res, next) {
    try {
      const { email, otp, newPassword } = req.body;

      if (!email || !otp || !newPassword) {
        return res.status(400).json({ 
          success: false, 
          message: 'All fields are required' 
        });
      }

      if (!validatePassword(newPassword)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Password must be at least 6 characters' 
        });
      }

      const result = await authService.resetPassword(email, otp, newPassword);
      
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  },

  // Logout
  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      const userId = req.user.id;

      await authService.logout(userId, refreshToken);

      res.clearCookie('refreshToken');
      
      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  },

  // Get current user
  async getCurrentUser(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        user: req.user,
      });
    } catch (error) {
      next(error);
    }
  },
};
