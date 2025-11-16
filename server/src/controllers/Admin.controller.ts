import { Request, Response } from 'express';
import AsyncHandler from '../middleware/AsyncHandler';
import User from '../models/User.model';
import Session from '../models/Session.model';
import AuditLog from '../models/AuditLog.model';
import { BadRequestError } from '../errors';
import { StatusCodes } from 'http-status-codes';

/**
 * @description Get all users (Admin only)
 * @GET /api/v1/admin/users
 * @access Admin
 */
export const getAllUsers = AsyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const filter: any = {};

  // Apply filters
  if (req.query.role) {
    filter.role = req.query.role;
  }
  if (req.query.accountStatus) {
    filter.accountStatus = req.query.accountStatus;
  }
  if (req.query.isVerified !== undefined) {
    filter.isVerified = req.query.isVerified === 'true';
  }
  if (req.query.mfaEnabled !== undefined) {
    filter.mfaEnabled = req.query.mfaEnabled === 'true';
  }

  // Search by name or email
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
      { username: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await User.countDocuments(filter);

  res.status(StatusCodes.OK).json({
    success: true,
    data: users,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
  });
});

/**
 * @description Get user by ID (Admin only)
 * @GET /api/v1/admin/users/:id
 * @access Admin
 */
export const getUserById = AsyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    throw new BadRequestError('User not found');
  }

  // Get user sessions
  const sessions = await Session.find({ user: user._id, isActive: true }).select(
    '-token'
  );

  // Get recent audit logs
  const auditLogs = await AuditLog.find({ user: user._id })
    .sort({ createdAt: -1 })
    .limit(20);

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      user,
      sessions,
      auditLogs,
    },
  });
});

/**
 * @description Update user (Admin only)
 * @PATCH /api/v1/admin/users/:id
 * @access Admin
 */
export const updateUser = AsyncHandler(async (req: Request, res: Response) => {
  const { name, email, role, accountStatus, permissions } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new BadRequestError('User not found');
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (accountStatus) user.accountStatus = accountStatus;
  if (permissions) user.permissions = permissions;

  await user.save();

  // Log event
  await AuditLog.create({
    user: user._id,
    event: 'user.updated',
    metadata: { updatedBy: 'admin', fields: Object.keys(req.body) },
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'success',
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User updated successfully',
    data: user,
  });
});

/**
 * @description Delete user (Admin only)
 * @DELETE /api/v1/admin/users/:id
 * @access Admin
 */
export const deleteUser = AsyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new BadRequestError('User not found');
  }

  // Soft delete - change account status
  user.accountStatus = 'deleted';
  await user.save();

  // Revoke all sessions
  await Session.updateMany({ user: user._id }, { isActive: false });

  // Log event
  await AuditLog.create({
    user: user._id,
    event: 'user.deleted',
    metadata: { deletedBy: 'admin' },
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'success',
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User deleted successfully',
  });
});

/**
 * @description Force password reset (Admin only)
 * @POST /api/v1/admin/users/:id/force-password-reset
 * @access Admin
 */
export const forcePasswordReset = AsyncHandler(
  async (req: Request, res: Response) => {
    const { newPassword } = req.body;

    if (!newPassword) {
      throw new BadRequestError('New password is required');
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      throw new BadRequestError('User not found');
    }

    user.password = newPassword;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    // Revoke all sessions
    await Session.updateMany({ user: user._id }, { isActive: false });

    // Log event
    await AuditLog.create({
      user: user._id,
      event: 'user.password_reset',
      metadata: { resetBy: 'admin', forced: true },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success',
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Password reset successfully',
    });
  }
);

/**
 * @description Get dashboard analytics (Admin only)
 * @GET /api/v1/admin/analytics
 * @access Admin
 */
export const getDashboardAnalytics = AsyncHandler(
  async (req: Request, res: Response) => {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ accountStatus: 'active' });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const mfaEnabledUsers = await User.countDocuments({ mfaEnabled: true });

    // New users in different periods
    const newUsersLast24h = await User.countDocuments({
      createdAt: { $gte: last24Hours },
    });
    const newUsersLast7Days = await User.countDocuments({
      createdAt: { $gte: last7Days },
    });
    const newUsersLast30Days = await User.countDocuments({
      createdAt: { $gte: last30Days },
    });

    // Session statistics
    const activeSessions = await Session.countDocuments({ isActive: true });
    const trustedDevices = await Session.countDocuments({ isTrusted: true });

    // Login statistics
    const successfulLogins = await AuditLog.countDocuments({
      event: 'user.login',
      createdAt: { $gte: last30Days },
      status: 'success',
    });
    const failedLogins = await AuditLog.countDocuments({
      event: 'failed.login',
      createdAt: { $gte: last30Days },
    });

    // Recent signups by day (last 30 days)
    const signupsByDay = await AuditLog.aggregate([
      {
        $match: {
          event: 'user.signup',
          createdAt: { $gte: last30Days },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Login methods distribution
    const loginMethodsDistribution = await AuditLog.aggregate([
      {
        $match: {
          event: 'user.login',
          createdAt: { $gte: last30Days },
          status: 'success',
        },
      },
      {
        $group: {
          _id: '$metadata.method',
          count: { $sum: 1 },
        },
      },
    ]);

    // User roles distribution
    const roleDistribution = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          verified: verifiedUsers,
          mfaEnabled: mfaEnabledUsers,
          newLast24h: newUsersLast24h,
          newLast7Days: newUsersLast7Days,
          newLast30Days: newUsersLast30Days,
        },
        sessions: {
          active: activeSessions,
          trusted: trustedDevices,
        },
        logins: {
          successful: successfulLogins,
          failed: failedLogins,
          successRate:
            successfulLogins + failedLogins > 0
              ? (successfulLogins / (successfulLogins + failedLogins)) * 100
              : 0,
        },
        charts: {
          signupsByDay,
          loginMethodsDistribution,
          roleDistribution,
        },
      },
    });
  }
);

/**
 * @description Get audit logs (Admin only)
 * @GET /api/v1/admin/audit-logs
 * @access Admin
 */
export const getAuditLogs = AsyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (req.query.event) {
      filter.event = req.query.event;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.userId) {
      filter.user = req.query.userId;
    }
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate as string);
      }
    }

    const logs = await AuditLog.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await AuditLog.countDocuments(filter);

    res.status(StatusCodes.OK).json({
      success: true,
      data: logs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  }
);
