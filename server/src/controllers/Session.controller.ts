import { Request, Response } from 'express';
import AsyncHandler from '../middleware/AsyncHandler';
import Session from '../models/Session.model';
import AuditLog from '../models/AuditLog.model';
import { BadRequestError, UnauthorizedError } from '../errors';
import { StatusCodes } from 'http-status-codes';

/**
 * @description Get all active sessions for a user
 * @GET /api/v1/sessions
 * @access Private
 */
export const getAllSessions = AsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.body.userId;

    if (!userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    const sessions = await Session.find({ user: userId, isActive: true })
      .sort({ lastActivity: -1 })
      .select('-token');

    res.status(StatusCodes.OK).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  }
);

/**
 * @description Revoke a specific session
 * @DELETE /api/v1/sessions/:sessionId
 * @access Private
 */
export const revokeSession = AsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.body.userId;
    const { sessionId } = req.params;

    if (!userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    if (!sessionId) {
      throw new BadRequestError('Session ID is required');
    }

    const session = await Session.findOne({ _id: sessionId, user: userId });

    if (!session) {
      throw new BadRequestError('Session not found');
    }

    session.isActive = false;
    await session.save();

    // Log event
    await AuditLog.create({
      user: userId,
      event: 'session.revoked',
      metadata: { sessionId },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success',
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Session revoked successfully',
    });
  }
);

/**
 * @description Revoke all sessions except current
 * @POST /api/v1/sessions/revoke-all
 * @access Private
 */
export const revokeAllSessions = AsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.body.userId;
    const currentSessionToken = req.body.refreshToken;

    if (!userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    await Session.updateMany(
      { user: userId, token: { $ne: currentSessionToken }, isActive: true },
      { isActive: false }
    );

    // Log event
    await AuditLog.create({
      user: userId,
      event: 'session.revoked',
      metadata: { action: 'revoke_all' },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success',
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'All other sessions revoked successfully',
    });
  }
);

/**
 * @description Trust a device
 * @POST /api/v1/sessions/:sessionId/trust
 * @access Private
 */
export const trustDevice = AsyncHandler(async (req: Request, res: Response) => {
  const userId = req.body.userId;
  const { sessionId } = req.params;

  if (!userId) {
    throw new UnauthorizedError('User not authenticated');
  }

  const session = await Session.findOne({ _id: sessionId, user: userId });

  if (!session) {
    throw new BadRequestError('Session not found');
  }

  session.isTrusted = true;
  await session.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Device trusted successfully',
  });
});

/**
 * @description Get session activity
 * @GET /api/v1/sessions/activity
 * @access Private
 */
export const getSessionActivity = AsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.body.userId;

    if (!userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;

    const sessions = await Session.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('-token');

    const total = await Session.countDocuments({ user: userId });

    res.status(StatusCodes.OK).json({
      success: true,
      data: sessions,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  }
);
