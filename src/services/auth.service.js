import User from '../models/User.model.js';
import OTP from '../models/OTP.model.js';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.util.js';
import { sendOTPEmail } from './email.service.js';

// Generate 4-digit OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const authService = {
  // Send OTP for signup
  async sendSignupOTP(email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email, type: 'signup' });

    const otp = generateOTP();
    
    // Save OTP to database
    await OTP.create({
      email,
      otp,
      type: 'signup',
    });

    await sendOTPEmail(email, otp);
    
    return { message: 'OTP sent successfully' };
  },

  // Signup with OTP verification
  async signup(name, email, password, otp) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({ 
      email, 
      otp, 
      type: 'signup',
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      throw new Error('Invalid or expired OTP');
    }

    // Create user
    const newUser = await User.create({
      name,
      email,
      password,
      isVerified: true,
    });

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    return { user: newUser, message: 'Signup successful' };
  },

  // Login
  async login(email, password) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens based on role
    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token
    await user.addRefreshToken(refreshToken);

    // Return user without password
    const userObject = user.toJSON();
    
    return {
      user: userObject,
      accessToken,
      refreshToken,
    };
  },

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    // Decode to get role first
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken, 'user');
    } catch (error) {
      try {
        decoded = verifyRefreshToken(refreshToken, 'admin');
      } catch (err) {
        throw new Error('Invalid refresh token');
      }
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify token exists in user's refresh tokens
    if (!user.hasRefreshToken(refreshToken)) {
      throw new Error('Refresh token not found');
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    // Replace old refresh token with new one
    await user.removeRefreshToken(refreshToken);
    await user.addRefreshToken(tokens.refreshToken);

    return tokens;
  },

  // Send OTP for password reset
  async sendPasswordResetOTP(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Email not found');
    }

    // Delete any existing reset OTPs
    await OTP.deleteMany({ email, type: 'reset' });

    const otp = generateOTP();
    
    await OTP.create({
      email,
      otp,
      type: 'reset',
    });

    await sendOTPEmail(email, otp);

    return { message: 'Password reset OTP sent successfully' };
  },

  // Reset password
  async resetPassword(email, otp, newPassword) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Email not found');
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({ 
      email, 
      otp, 
      type: 'reset',
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      throw new Error('Invalid or expired OTP');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // Clear all refresh tokens (force re-login)
    user.refreshTokens = [];
    await user.save();

    return { message: 'Password reset successful' };
  },

  // Logout
  async logout(userId, refreshToken) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await user.removeRefreshToken(refreshToken);
    return { message: 'Logout successful' };
  },
};
