import { Request, Response } from 'express';
import crypto from 'crypto';
import AsyncHandler from '../middleware/AsyncHandler';
import User from '../models/User.model';
import Session from '../models/Session.model';
import AuditLog from '../models/AuditLog.model';
import { BadRequestError } from '../errors';
import { StatusCodes } from 'http-status-codes';
import SendEmail from '../utils/SendEmail';
import { parseDeviceInfo } from '../utils/DeviceFingerprint';
import attachCookieToResponse from '../utils/JWT';
import { UserProps } from '../types';
import CreateHash from '../utils/CreateHash';

/**
 * @description Request magic link
 * @POST /api/v1/auth/magic-link/request
 * @access Public
 */
export const requestMagicLink = AsyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      throw new BadRequestError('Email is required');
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists
      res.status(StatusCodes.OK).json({
        success: true,
        message: 'If an account exists, a magic link has been sent to your email',
      });
      return;
    }

    // Generate magic link token
    const magicToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = CreateHash(magicToken);

    // Store hashed token in user
    user.verificationToken = hashedToken;
    user.passwordTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    // Create magic link URL
    const magicLinkUrl = `${process.env.CLIENT_URL}/auth/magic-link/verify?token=${magicToken}&email=${email}`;

    // Send email
    await SendEmail({
      email: user.email,
      name: user.name,
      subject: 'AuthX - Magic Link Login',
      message: `Click the link to login: ${magicLinkUrl}`,
      category: 'confirmation',
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'If an account exists, a magic link has been sent to your email',
    });
  }
);

/**
 * @description Verify magic link and login
 * @POST /api/v1/auth/magic-link/verify
 * @access Public
 */
export const verifyMagicLink = AsyncHandler(
  async (req: Request, res: Response) => {
    const { token, email } = req.body;

    if (!token || !email) {
      throw new BadRequestError('Token and email are required');
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new BadRequestError('Invalid or expired magic link');
    }

    const hashedToken = CreateHash(token);

    if (user.verificationToken !== hashedToken) {
      throw new BadRequestError('Invalid or expired magic link');
    }

    if (
      !user.passwordTokenExpires ||
      Date.now() > user.passwordTokenExpires.getTime()
    ) {
      throw new BadRequestError('Invalid or expired magic link');
    }

    // Clear token
    user.verificationToken = '';
    user.passwordTokenExpires = undefined;
    user.isVerified = true;
    user.lastLogin = new Date();
    user.lastLoginIp = req.ip || 'unknown';
    await user.save();

    // Create session
    const deviceInfo = parseDeviceInfo(req);
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await Session.create({
      user: user._id,
      token: refreshToken,
      deviceFingerprint: deviceInfo.fingerprint,
      deviceInfo: {
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        device: deviceInfo.device,
      },
      ip: deviceInfo.ip,
      userAgent: deviceInfo.userAgent,
      isActive: true,
      expiresAt,
    });

    // Log event
    await AuditLog.create({
      user: user._id,
      event: 'user.login',
      metadata: { method: 'magiclink' },
      ip: deviceInfo.ip,
      userAgent: deviceInfo.userAgent,
      status: 'success',
    });

    const tokenObj: UserProps = {
      userId: user._id,
      name: user.name,
      email: user.email,
    };

    attachCookieToResponse({ res, user: tokenObj, token: refreshToken });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Login successful',
      user: tokenObj,
    });
  }
);

/**
 * @description Request OTP for phone login
 * @POST /api/v1/auth/phone/request-otp
 * @access Public
 */
export const requestPhoneOTP = AsyncHandler(
  async (req: Request, res: Response) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      throw new BadRequestError('Phone number is required');
    }

    let user = await User.findOne({ phoneNumber });

    if (!user) {
      // Create new user with phone number
      user = await User.create({
        phoneNumber,
        name: `User_${phoneNumber.slice(-4)}`,
        email: `${phoneNumber}@temp.authx.com`, // Temporary email
        preferredLoginMethod: 'phone',
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = CreateHash(otp);

    // Store hashed OTP
    user.verificationToken = hashedOTP;
    user.passwordTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // TODO: Send OTP via SMS provider (Twilio, Africa's Talking, etc.)
    // For now, just return success
    console.log(`OTP for ${phoneNumber}: ${otp}`);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'OTP sent to your phone number',
    });
  }
);

/**
 * @description Verify OTP and login
 * @POST /api/v1/auth/phone/verify-otp
 * @access Public
 */
export const verifyPhoneOTP = AsyncHandler(
  async (req: Request, res: Response) => {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      throw new BadRequestError('Phone number and OTP are required');
    }

    const user = await User.findOne({ phoneNumber });

    if (!user) {
      throw new BadRequestError('Invalid OTP');
    }

    const hashedOTP = CreateHash(otp);

    if (user.verificationToken !== hashedOTP) {
      throw new BadRequestError('Invalid OTP');
    }

    if (
      !user.passwordTokenExpires ||
      Date.now() > user.passwordTokenExpires.getTime()
    ) {
      throw new BadRequestError('OTP expired');
    }

    // Clear OTP
    user.verificationToken = '';
    user.passwordTokenExpires = undefined;
    user.phoneVerified = true;
    user.lastLogin = new Date();
    user.lastLoginIp = req.ip || 'unknown';
    await user.save();

    // Create session
    const deviceInfo = parseDeviceInfo(req);
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await Session.create({
      user: user._id,
      token: refreshToken,
      deviceFingerprint: deviceInfo.fingerprint,
      deviceInfo: {
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        device: deviceInfo.device,
      },
      ip: deviceInfo.ip,
      userAgent: deviceInfo.userAgent,
      isActive: true,
      expiresAt,
    });

    // Log event
    await AuditLog.create({
      user: user._id,
      event: 'user.login',
      metadata: { method: 'phone' },
      ip: deviceInfo.ip,
      userAgent: deviceInfo.userAgent,
      status: 'success',
    });

    const tokenObj: UserProps = {
      userId: user._id,
      name: user.name,
      email: user.email,
    };

    attachCookieToResponse({ res, user: tokenObj, token: refreshToken });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Login successful',
      user: tokenObj,
    });
  }
);
