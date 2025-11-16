import { Request, Response } from 'express';
import crypto from 'crypto';
import AsyncHandler from '../middleware/AsyncHandler';
import Webhook from '../models/Webhook.model';
import { BadRequestError } from '../errors';
import { StatusCodes } from 'http-status-codes';

/**
 * @description Create webhook
 * @POST /api/v1/webhooks
 * @access Admin
 */
export const createWebhook = AsyncHandler(
  async (req: Request, res: Response) => {
    const { url, events, headers, retryAttempts } = req.body;

    if (!url || !events || events.length === 0) {
      throw new BadRequestError('URL and events are required');
    }

    // Generate secret
    const secret = crypto.randomBytes(32).toString('hex');

    const webhook = await Webhook.create({
      url,
      events,
      secret,
      headers,
      retryAttempts: retryAttempts || 3,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: webhook,
    });
  }
);

/**
 * @description Get all webhooks
 * @GET /api/v1/webhooks
 * @access Admin
 */
export const getAllWebhooks = AsyncHandler(
  async (req: Request, res: Response) => {
    const webhooks = await Webhook.find().sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({
      success: true,
      count: webhooks.length,
      data: webhooks,
    });
  }
);

/**
 * @description Get webhook by ID
 * @GET /api/v1/webhooks/:id
 * @access Admin
 */
export const getWebhookById = AsyncHandler(
  async (req: Request, res: Response) => {
    const webhook = await Webhook.findById(req.params.id);

    if (!webhook) {
      throw new BadRequestError('Webhook not found');
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: webhook,
    });
  }
);

/**
 * @description Update webhook
 * @PATCH /api/v1/webhooks/:id
 * @access Admin
 */
export const updateWebhook = AsyncHandler(
  async (req: Request, res: Response) => {
    const { url, events, headers, retryAttempts, isActive } = req.body;

    const webhook = await Webhook.findById(req.params.id);

    if (!webhook) {
      throw new BadRequestError('Webhook not found');
    }

    if (url) webhook.url = url;
    if (events) webhook.events = events;
    if (headers) webhook.headers = headers;
    if (retryAttempts !== undefined) webhook.retryAttempts = retryAttempts;
    if (isActive !== undefined) webhook.isActive = isActive;

    await webhook.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Webhook updated successfully',
      data: webhook,
    });
  }
);

/**
 * @description Delete webhook
 * @DELETE /api/v1/webhooks/:id
 * @access Admin
 */
export const deleteWebhook = AsyncHandler(
  async (req: Request, res: Response) => {
    const webhook = await Webhook.findByIdAndDelete(req.params.id);

    if (!webhook) {
      throw new BadRequestError('Webhook not found');
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Webhook deleted successfully',
    });
  }
);

/**
 * @description Regenerate webhook secret
 * @POST /api/v1/webhooks/:id/regenerate-secret
 * @access Admin
 */
export const regenerateSecret = AsyncHandler(
  async (req: Request, res: Response) => {
    const webhook = await Webhook.findById(req.params.id);

    if (!webhook) {
      throw new BadRequestError('Webhook not found');
    }

    webhook.secret = crypto.randomBytes(32).toString('hex');
    await webhook.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Secret regenerated successfully',
      data: {
        secret: webhook.secret,
      },
    });
  }
);
