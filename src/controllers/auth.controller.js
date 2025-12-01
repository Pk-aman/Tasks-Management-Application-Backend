import User from '../models/User.model.js';
import OTP from '../models/OTP.model.js';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.util.js';
import { sendOTPEmail } from '../services/email.service.js';

// Generate 4-digit OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const authController = {
  // Send OTP for signup
  async sendSignupOTP(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required',
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered',
        });
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

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
      });
    } catch (error) {
      console.error('Send signup OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP',
      });
    }
  },

  async signup(req, res) {
    try {
      const { name, email, password, role } = req.body;
  
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required',
        });
      }
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered',
        });
      }
  
      // Create user directly without OTP verification
      const newUser = await User.create({
        name,
        email,
        password,
        role: role || 'user',
        isVerified: true, // Auto-verify since admin is creating
      });
  
      // Send welcome email to the new user
      try {
        await sendWelcomeEmail(email, name, role || 'user');
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the registration if email fails
      }
  
      res.status(201).json({
        success: true,
        message: 'User registered successfully. Welcome email sent.',
        emailSent: true,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Signup failed',
      });
    }
  },
  
  // // Reset password
  // async resetPassword(req, res) {
  //   try {
  //     const { email, otp, newPassword } = req.body;
  
  //     if (!email || !otp || !newPassword) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'All fields are required',
  //       });
  //     }
  
  //     // Verify OTP
  //     const otpRecord = await OTP.findOne({
  //       email,
  //       otp,
  //       type: 'reset',
  //       expiresAt: { $gt: new Date() },
  //     });
  
  //     if (!otpRecord) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'Invalid or expired OTP',
  //       });
  //     }
  
  //     // Update password
  //     const user = await User.findOne({ email });
  //     if (!user) {
  //       return res.status(404).json({
  //         success: false,
  //         message: 'User not found',
  //       });
  //     }
  
  //     user.password = newPassword;
  //     await user.save();
  
  //     // Delete used OTP
  //     await OTP.deleteOne({ _id: otpRecord._id });
  
  //     // Send password reset success email
  //     try {
  //       await sendPasswordResetSuccessEmail(email, user.name);
  //     } catch (emailError) {
  //       console.error('Failed to send password reset success email:', emailError);
  //     }
  
  //     res.status(200).json({
  //       success: true,
  //       message: 'Password reset successful',
  //     });
  //   } catch (error) {
  //     console.error('Reset password error:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: 'Failed to reset password',
  //     });
  //   }
  // },


  // Login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
      }

      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Generate tokens based on role
      const { accessToken, refreshToken } = generateTokens(user);

      // Store refresh token
      await user.addRefreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
      });
    }
  },

  // Refresh access token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required',
        });
      }

      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded) {
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired refresh token',
        });
      }

      const user = await User.findById(decoded.id);
      if (!user || !user.hasRefreshToken(refreshToken)) {
        return res.status(403).json({
          success: false,
          message: 'Invalid refresh token',
        });
      }

      // Generate new tokens
      const tokens = generateTokens(user);

      // Replace old refresh token with new one
      await user.removeRefreshToken(refreshToken);
      await user.addRefreshToken(tokens.refreshToken);

      res.status(200).json({
        success: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to refresh token',
      });
    }
  },

  // Logout
  async logout(req, res) {
    try {
      const { refreshToken } = req.body;

      if (refreshToken && req.user) {
        const user = await User.findById(req.user.id);
        if (user) {
          await user.removeRefreshToken(refreshToken);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
      });
    }
  },

  // Send password reset OTP
  async sendPasswordResetOTP(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required',
        });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Delete any existing OTPs for this email
      await OTP.deleteMany({ email, type: 'reset' });

      const otp = generateOTP();

      // Save OTP to database
      await OTP.create({
        email,
        otp,
        type: 'reset',
      });

      await sendOTPEmail(email, otp);

      res.status(200).json({
        success: true,
        message: 'Password reset OTP sent successfully',
      });
    } catch (error) {
      console.error('Send password reset OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP',
      });
    }
  },

  // Reset password
  async resetPassword(req, res) {
    try {
      const { email, otp, newPassword } = req.body;

      if (!email || !otp || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required',
        });
      }

      // Verify OTP
      const otpRecord = await OTP.findOne({
        email,
        otp,
        type: 'reset',
        expiresAt: { $gt: new Date() },
      });

      if (!otpRecord) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP',
        });
      }

      // Update password
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      user.password = newPassword;
      await user.save();

      // Delete used OTP
      await OTP.deleteOne({ _id: otpRecord._id });

      res.status(200).json({
        success: true,
        message: 'Password reset successful',
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset password',
      });
    }
  },

  // Get current user
  async getCurrentUser(req, res) {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user',
      });
    }
  },

  // Get all users (Admin only) - THIS WAS MISSING
  async getAllUsers(req, res) {
    try {
      const users = await User.find()
        .select('-password -refreshTokens')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        users: users.map(user => ({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
      });
    }
  },
};
