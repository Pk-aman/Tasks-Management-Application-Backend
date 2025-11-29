import nodemailer from 'nodemailer';
import { config } from '../config/config.js';

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
  tls: {
    rejectUnauthorized: true,
  },
});

// Send OTP Email
export const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"Task Management App" <${config.email.user}>`,
      to: email,
      subject: 'Your OTP for Verification',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Email Verification</h2>
          <p>Your OTP for verification is:</p>
          <h1 style="color: #4F46E5; letter-spacing: 5px;">${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 OTP sent to ${email}: ${otp}`);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    // In development, log OTP to console
    if (config.nodeEnv === 'development') {
      console.log(`📧 DEV MODE - OTP for ${email}: ${otp}`);
    }
    throw new Error('Failed to send email');
  }
};

// Send Welcome Email (Account Created)
export const sendWelcomeEmail = async (to, name, role) => {
  const isAdmin = role === 'admin';
  
  try {
    const mailOptions = {
      from: `"Task Management App" <${config.email.user}>`,
      to,
      subject: `Welcome to Task Management System - ${isAdmin ? 'Admin' : 'User'} Account Created`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9fafb;
            }
            .header {
              background: linear-gradient(135deg, #10B981 0%, #059669 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 0 0 10px 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .badge {
              display: inline-block;
              padding: 5px 15px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .badge-admin {
              background-color: #FEE2E2;
              color: #DC2626;
            }
            .badge-user {
              background-color: #DBEAFE;
              color: #2563EB;
            }
            .credentials-box {
              background-color: #f3f4f6;
              border-left: 4px solid #10B981;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #10B981 0%, #059669 100%);
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin-top: 20px;
            }
            .warning {
              background-color: #FEF3C7;
              border-left: 4px solid #F59E0B;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 12px;
            }
            .feature-list {
              margin: 20px 0;
            }
            .feature-item {
              padding: 10px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .feature-item:last-child {
              border-bottom: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🎉 Welcome to Task Management System!</h1>
            </div>
            
            <div class="content">
              <span class="badge ${isAdmin ? 'badge-admin' : 'badge-user'}">
                ${isAdmin ? '👑 ADMIN ACCOUNT' : '👤 USER ACCOUNT'}
              </span>
              
              <h2>Hello ${name}!</h2>
              
              <p>Your ${isAdmin ? 'administrator' : 'user'} account has been successfully created by the system administrator. You can now access the Task Management System.</p>
              
              <div class="credentials-box">
                <h3 style="margin-top: 0;">📧 Your Login Credentials</h3>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${to}</p>
                <p style="margin: 5px 0;"><strong>Account Type:</strong> ${isAdmin ? 'Administrator' : 'User'}</p>
              </div>
              
              <div class="warning">
                <h4 style="margin-top: 0;">⚠️ Important Security Notice</h4>
                <p style="margin: 5px 0;">For security reasons, please log in and <strong>change your password immediately</strong> after your first login.</p>
              </div>
              
              <div class="feature-list">
                <h3>What you can do:</h3>
                ${isAdmin ? `
                  <div class="feature-item">✅ Create and manage projects</div>
                  <div class="feature-item">✅ Register new users and admins</div>
                  <div class="feature-item">✅ Assign team members to projects</div>
                  <div class="feature-item">✅ Full system access and control</div>
                  <div class="feature-item">✅ View dashboard analytics</div>
                ` : `
                  <div class="feature-item">✅ View assigned projects</div>
                  <div class="feature-item">✅ Collaborate with team members</div>
                  <div class="feature-item">✅ Update task status</div>
                  <div class="feature-item">✅ Track project progress</div>
                `}
              </div>
              
              enter>
                <a href="${config.app?.frontendUrl || 'http://localhost:5173'}/login" class="button">
                  🚀 Login to Your Account
                </a>
              </center>
              
              <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
                <p>If you did not request this account or have any questions, please contact your system administrator.</p>
                <p style="margin-top: 15px;">
                  &copy; ${new Date().getFullYear()} Task Management System. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Welcome email sent to ${to} (${role})`);
    return true;
  } catch (error) {
    console.error('Welcome email send error:', error);
    // In development, log to console
    if (config.nodeEnv === 'development') {
      console.log(`📧 DEV MODE - Welcome email for ${to} (${role}): ${name}`);
    }
    throw new Error('Failed to send welcome email');
  }
};

// Send Password Reset Success Email
export const sendPasswordResetSuccessEmail = async (to, name) => {
  try {
    const mailOptions = {
      from: `"Task Management App" <${config.email.user}>`,
      to,
      subject: 'Password Reset Successful',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #10B981 0%, #059669 100%);
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 0 0 10px 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .warning {
              background-color: #FEF3C7;
              border-left: 4px solid #F59E0B;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #10B981 0%, #059669 100%);
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">✅ Password Reset Successful</h2>
            </div>
            
            <div class="content">
              <p>Hello ${name},</p>
              <p>Your password has been successfully reset.</p>
              <p>You can now log in to your account using your new password.</p>
              
              <div class="warning">
                <strong>⚠️ Security Tip:</strong> If you did not make this change, please contact your administrator immediately.
              </div>
              
              enter>
                <a href="${config.app?.frontendUrl || 'http://localhost:5173'}/login" class="button">
                  🔐 Login Now
                </a>
              </center>
              
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Task Management System</p>
                <p>This is an automated email. Please do not reply.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Password reset success email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Password reset email send error:', error);
    // Don't throw error, just log it
    if (config.nodeEnv === 'development') {
      console.log(`📧 DEV MODE - Password reset email for ${to}`);
    }
  }
};
