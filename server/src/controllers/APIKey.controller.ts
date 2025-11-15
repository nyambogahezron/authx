import { Request, Response } from 'express';
import AsyncHandler from '../middleware/AsyncHandler';
import APIKey from '../models/APIKey.model';
import { BadRequestError } from '../errors';
import { StatusCodes } from 'http-status-codes';

/**
 * @description Create API key
 * @POST /api/v1/api-keys
 * @access Private
 */
export const createAPIKey = AsyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req.user as any).userId || (req.user as any)._id;
    const { name, environment, permissions, rateLimit, expiresAt } = req.body;

    if (!name) {
      throw new BadRequestError('API key name is required');
    }

    // Generate key
    const { key, hashedKey, prefix } = (APIKey as any).generateKey();

    // Create API key
    const apiKey = await APIKey.create({
      user: userId,
      name,
      key: key.substring(0, 16) + '...', // Store truncated version for display
      hashedKey,
      prefix,
      environment: environment || 'development',
      permissions: permissions || [],
      rateLimit: rateLimit || {
        requestsPerHour: 1000,
        requestsPerDay: 10000,
      },
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    // Return full key only once (on creation)
    res.status(StatusCodes.CREATED).json({
      success: true,
      message:
        'API key created successfully. Save this key - it will not be shown again.',
      data: {
        ...apiKey.toObject(),
        key, // Full key only shown once
      },
    });
  }
);

/**
 * @description Get all API keys for user
 * @GET /api/v1/api-keys
 * @access Private
 */
export const getAllAPIKeys = AsyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req.user as any).userId || (req.user as any)._id;

    const apiKeys = await APIKey.find({ user: userId })
      .select('-hashedKey')
      .sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({
      success: true,
      count: apiKeys.length,
      data: apiKeys,
    });
  }
);

/**
 * @description Get API key by ID
 * @GET /api/v1/api-keys/:id
 * @access Private
 */
export const getAPIKeyById = AsyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req.user as any).userId || (req.user as any)._id;

    const apiKey = await APIKey.findOne({
      _id: req.params.id,
      user: userId,
    }).select('-hashedKey');

    if (!apiKey) {
      throw new BadRequestError('API key not found');
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: apiKey,
    });
  }
);

/**
 * @description Update API key
 * @PATCH /api/v1/api-keys/:id
 * @access Private
 */
export const updateAPIKey = AsyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req.user as any).userId || (req.user as any)._id;
    const { name, permissions, rateLimit, isActive } = req.body;

    const apiKey = await APIKey.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!apiKey) {
      throw new BadRequestError('API key not found');
    }

    if (name) apiKey.name = name;
    if (permissions) apiKey.permissions = permissions;
    if (rateLimit) apiKey.rateLimit = rateLimit;
    if (isActive !== undefined) apiKey.isActive = isActive;

    await apiKey.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'API key updated successfully',
      data: apiKey,
    });
  }
);

/**
 * @description Delete API key
 * @DELETE /api/v1/api-keys/:id
 * @access Private
 */
export const deleteAPIKey = AsyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req.user as any).userId || (req.user as any)._id;

    const apiKey = await APIKey.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!apiKey) {
      throw new BadRequestError('API key not found');
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'API key deleted successfully',
    });
  }
);

/**
 * @description Rotate API key
 * @POST /api/v1/api-keys/:id/rotate
 * @access Private
 */
export const rotateAPIKey = AsyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req.user as any).userId || (req.user as any)._id;

    const apiKey = await APIKey.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!apiKey) {
      throw new BadRequestError('API key not found');
    }

    // Generate new key
    const { key, hashedKey, prefix } = (APIKey as any).generateKey();

    apiKey.key = key.substring(0, 16) + '...';
    apiKey.hashedKey = hashedKey;
    apiKey.prefix = prefix;
    apiKey.usageCount = 0;

    await apiKey.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message:
        'API key rotated successfully. Save this key - it will not be shown again.',
      data: {
        ...apiKey.toObject(),
        key, // Full key only shown once
      },
    });
  }
);
