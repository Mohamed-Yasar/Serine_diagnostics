import express from 'express';
import bcrypt from 'bcryptjs';

import { prisma } from '../prisma';
import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/auth';

const router = express.Router();

// ========================================
// ACTIVATE / DEACTIVATE USER
// PATCH /api/users/:id/status
// ADMIN ONLY
// ========================================

router.patch(
  '/:id/status',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { active } = req.body;

      if (typeof active !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Active must be true or false',
        });
      }

      const user = await prisma.staffUser.update({
        where: { id },
        data: { active },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          active: true,
          updatedAt: true,
        },
      });

      return res.status(200).json({
        success: true,
        message: active
          ? 'User activated successfully'
          : 'User deactivated successfully',
        user,
      });
    } catch (error) {
      console.error('Update user status error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to update user status',
      });
    }
  }
);

// ========================================
// EDIT EXISTING USER
// PATCH /api/users/:id
// ADMIN ONLY
// ========================================

router.patch(
  '/:id',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { email, firstName, lastName, role, password } = req.body;

      if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !role) {
        return res.status(400).json({
          success: false,
          message: 'First name, last name, email and role are required',
        });
      }

      if (!['STAFF', 'DOCTOR', 'PROVIDER'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Role must be either STAFF, DOCTOR or PROVIDER',
        });
      }

      const normalizedEmail = email.toLowerCase().trim();

      const existingUser = await prisma.staffUser.findFirst({
        where: {
          email: normalizedEmail,
          NOT: { id },
        },
        select: { id: true },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'A user with this email already exists',
        });
      }

      const data: {
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        passwordHash?: string;
      } = {
        email: normalizedEmail,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
      };

      if (typeof password === 'string' && password.length > 0) {
        if (password.length < 8) {
          return res.status(400).json({
            success: false,
            message: 'Password must be at least 8 characters long',
          });
        }

        data.passwordHash = await bcrypt.hash(password, 12);
      }

      const user = await prisma.staffUser.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          active: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        user,
      });
    } catch (error) {
      console.error('Update user error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to update user',
      });
    }
  }
);

// ========================================
// GET ALL STAFF / DOCTOR USERS
// GET /api/users
// ADMIN ONLY
// ========================================

router.get(
  '/',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (req, res) => {
    try {
      const users = await prisma.staffUser.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          active: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({
        success: true,
        count: users.length,
        users,
      });
    } catch (error) {
      console.error('Get users error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
      });
    }
  }
);

// ========================================
// CREATE STAFF / DOCTOR USER
// POST /api/users
// ADMIN ONLY
// ========================================

router.post(
  '/',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (req, res) => {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      if (!email || !password || !firstName || !lastName || !role) {
        return res.status(400).json({
          success: false,
          message: 'Email, password, first name, last name and role are required',
        });
      }

      if (!['STAFF', 'DOCTOR', 'PROVIDER'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Role must be either STAFF, DOCTOR or PROVIDER',
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long',
        });
      }

      const normalizedEmail = email.toLowerCase().trim();

      const existingUser = await prisma.staffUser.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'A user with this email already exists',
        });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await prisma.staffUser.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          role,
          active: true,
        },
      });

      return res.status(201).json({
        success: true,
        message: `${role} account created successfully`,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          active: user.active,
        },
      });
    } catch (error) {
      console.error('Create user error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to create user',
      });
    }
  }
);

export default router;
