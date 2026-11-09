import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Resend } from 'resend';

import { prisma } from '../prisma';

const router = express.Router();

const RESET_TOKEN_EXPIRY_MINUTES = 30;

const resend = new Resend(process.env.RESEND_API_KEY);

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

// ========================================
// LOGIN
// POST /api/auth/login
// ========================================

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await prisma.staffUser.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');

      return res.status(500).json({
        success: false,
        message: 'Server authentication configuration error',
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '8h',
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to authenticate user',
    });
  }
});

// ========================================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// ========================================

router.post('/forgot-password', async (req, res) => {
  const genericResponse = {
    success: true,
    message:
      'If an account exists with that email address, password reset instructions have been sent.',
  };

  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email address is required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.staffUser.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    /*
     * Always return the same response when the account does not exist
     * or is inactive. This prevents account enumeration.
     */
    if (!user || !user.active) {
      return res.status(200).json(genericResponse);
    }

    if (
      !process.env.RESEND_API_KEY ||
      !process.env.RESEND_FROM_EMAIL
    ) {
      console.error(
        'Password reset email configuration is missing. Required: RESEND_API_KEY and RESEND_FROM_EMAIL.'
      );

      return res.status(500).json({
        success: false,
        message: 'Password reset sender email is not configured.',
      });
    }

    // Invalidate previous unused tokens for this user.
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    // Generate a cryptographically secure raw token.
    const rawToken = crypto.randomBytes(32).toString('hex');

    // Store only the SHA-256 hash in the database.
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const expiresAt = new Date(
      Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000
    );

    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    const frontendUrl =
      process.env.FRONTEND_URL || 'http://localhost:3000';

    const resetUrl = `${frontendUrl}/#reset-password/${rawToken}`;

    const firstName = escapeHtml(user.firstName || 'there');

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: user.email,
      subject: 'Reset Your Serine Diagnostics Password',
      html: `
        <!DOCTYPE html>
        <html>
          <body style="margin:0;padding:0;background:#f5f9fa;font-family:Arial,Helvetica,sans-serif;color:#103d4a;">
            <div style="max-width:620px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dcebed;">
              
              <div style="background:#103d4a;padding:28px 32px;">
                <h1 style="margin:0;color:#ffffff;font-size:24px;">
                  Serine Diagnostics
                </h1>
                <p style="margin:8px 0 0;color:#b8d9dd;font-size:13px;">
                  Secure Account Recovery
                </p>
              </div>

              <div style="padding:36px 32px;">
                <h2 style="margin:0 0 14px;color:#103d4a;font-size:22px;">
                  Reset Your Password
                </h2>

                <p style="font-size:15px;line-height:1.7;color:#5f7881;">
                  Hello ${firstName},
                </p>

                <p style="font-size:15px;line-height:1.7;color:#5f7881;">
                  We received a request to reset the password for your
                  Serine Diagnostics staff account.
                </p>

                <div style="text-align:center;margin:30px 0;">
                  <a
                    href="${resetUrl}"
                    style="display:inline-block;background:#168d90;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:bold;"
                  >
                    Reset Password
                  </a>
                </div>

                <p style="font-size:13px;line-height:1.7;color:#78919a;">
                  This password reset link will expire in
                  <strong>30 minutes</strong>.
                </p>

                <p style="font-size:13px;line-height:1.7;color:#78919a;">
                  If you did not request a password reset, you can safely
                  ignore this email. Your existing password will remain unchanged.
                </p>

                <hr style="border:0;border-top:1px solid #e5eeee;margin:28px 0;" />

                <p style="font-size:11px;line-height:1.6;color:#9aadb2;">
                  For security reasons, never share your password or password
                  reset link with anyone.
                </p>
              </div>

            </div>
          </body>
        </html>
      `,
    });

    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error('Forgot password error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to process password reset request',
    });
  }
});

// ========================================
// RESET PASSWORD
// POST /api/auth/reset-password
// ========================================

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and password are required',
      });
    }

    if (typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid password',
      });
    }

    // Minimum 8 characters.
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
    }

    // Strong password requirements.
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter.',
      });
    }

    if (!/[a-z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one lowercase letter.',
      });
    }

    if (!/[0-9]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one number.',
      });
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one special character.',
      });
    }

    // Hash the token received from the email.
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: {
        tokenHash,
      },
      include: {
        user: true,
      },
    });

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset link.',
      });
    }

    if (resetToken.usedAt) {
      return res.status(400).json({
        success: false,
        message: 'This password reset link has already been used.',
      });
    }

    if (resetToken.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This password reset link has expired.',
      });
    }

    if (!resetToken.user.active) {
      return res.status(400).json({
        success: false,
        message: 'This staff account is inactive.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    /*
     * The password update is tied directly to resetToken.userId.
     *
     * The submitted request does NOT contain an email or user ID.
     * Therefore a Doctor cannot choose another user's account.
     */
    await prisma.$transaction([
      prisma.staffUser.update({
        where: {
          id: resetToken.userId,
        },
        data: {
          passwordHash,
        },
      }),

      prisma.passwordResetToken.update({
        where: {
          id: resetToken.id,
        },
        data: {
          usedAt: new Date(),
        },
      }),

      prisma.passwordResetToken.updateMany({
        where: {
          userId: resetToken.userId,
          id: {
            not: resetToken.id,
          },
          usedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now sign in.',
    });
  } catch (error) {
    console.error('Reset password error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to reset password',
    });
  }
});

export default router;