import { Request, Response } from 'express';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import AsyncHandler from '../middleware/AsyncHandler';
import MFA from '../models/MFA.model';
import User from '../models/User.model';
import AuditLog from '../models/AuditLog.model';
import { BadRequestError, UnauthorizedError } from '../errors';
import { StatusCodes } from 'http-status-codes';
import SendEmail from '../utils/SendEmail';
import { generateCode } from '../utils/GenerateCode';

/**
 * @description Setup TOTP (Authenticator App)
 * @POST /api/v1/mfa/totp/setup
 * @access Private
 */
export const setupTOTP = AsyncHandler(async (req: Request, res: Response) => {
  const userId = req.body.userId;

  if (!userId) {
    throw new UnauthorizedError('User not authenticated');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new BadRequestError('User not found');
  }

  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `AuthX (${user.email})`,
    length: 32,
  });

  // Create or update MFA record
  let mfa = await MFA.findOne({ user: userId });
  if (!mfa) {
    mfa = await MFA.create({
      user: userId,
      methods: {
        totp: {
          secret: secret.base32,
          enabled: false,
          verified: false,
        },
        sms: { enabled: false },
        email: { enabled: false },
      },
    });
  } else {
    if (!mfa.methods) {
      mfa.methods = {
        sms: { enabled: false },
        email: { enabled: false },
        totp: { enabled: false, verified: false },
      };
    }
    mfa.methods.totp = {
      secret: secret.base32,
      enabled: false,
      verified: false,
    };
    await mfa.save();
  }

  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      secret: secret.base32,
      qrCode: qrCodeUrl,
    },
  });
});

/**
 * @description Verify TOTP and enable it
 * @POST /api/v1/mfa/totp/verify
 * @access Private
 */
export const verifyTOTP = AsyncHandler(async (req: Request, res: Response) => {
  const { userId, token } = req.body;

  if (!userId || !token) {
    throw new BadRequestError('User ID and token are required');
  }

  const mfa = await MFA.findOne({ user: userId });
  if (!mfa || !mfa.methods?.totp?.secret) {
    throw new BadRequestError('TOTP not set up');
  }

  // Verify token
  const verified = speakeasy.totp.verify({
    secret: mfa.methods.totp.secret,
    encoding: 'base32',
    token,
    window: 2,
  });

  if (!verified) {
    throw new BadRequestError('Invalid token');
  }

  // Generate backup codes
  const backupCodes = Array.from({ length: 10 }, () => ({
    code: crypto.randomBytes(4).toString('hex').toUpperCase(),
    used: false,
  }));

  // Enable TOTP
  if (!mfa.methods) {
    mfa.methods = {
      sms: { enabled: false },
      email: { enabled: false },
      totp: { enabled: false, verified: false },
    };
  }
  if (mfa.methods.totp) {
    mfa.methods.totp.enabled = true;
    mfa.methods.totp.verified = true;
  }
  mfa.isEnabled = true;
  mfa.preferredMethod = 'totp';
  mfa.backupCodes = backupCodes as any;
  await mfa.save();

  // Update user
  await User.findByIdAndUpdate(userId, { mfaEnabled: true });

  // Log event
  await AuditLog.create({
    user: userId,
    event: 'mfa.enabled',
    metadata: { method: 'totp' },
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'success',
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'TOTP enabled successfully',
    backupCodes: backupCodes.map((c) => c.code),
  });
});

/**
 * @description Verify MFA token during login
 * @POST /api/v1/mfa/verify
 * @access Public
 */
export const verifyMFA = AsyncHandler(async (req: Request, res: Response) => {
  const { userId, token, method } = req.body;

  if (!userId || !token) {
    throw new BadRequestError('User ID and token are required');
  }

  const mfa = await MFA.findOne({ user: userId });
  if (!mfa || !mfa.isEnabled) {
    throw new BadRequestError('MFA not enabled for this user');
  }

  let verified = false;

  // Verify based on method
  if (method === 'totp' && mfa.methods?.totp?.enabled) {
    verified = speakeasy.totp.verify({
      secret: mfa.methods.totp.secret!,
      encoding: 'base32',
      token,
      window: 2,
    });
  } else if (method === 'backup') {
    // Check backup codes
    const backupCode = mfa.backupCodes.find(
      (c: any) => c.code === token.toUpperCase() && !c.used
    );
    if (backupCode) {
      backupCode.used = true;
      backupCode.usedAt = new Date();
      await mfa.save();
      verified = true;
    }
  }

  if (!verified) {
    await AuditLog.create({
      user: userId,
      event: 'mfa.verified',
      metadata: { method },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'failure',
    });
    throw new UnauthorizedError('Invalid MFA token');
  }

  await AuditLog.create({
    user: userId,
    event: 'mfa.verified',
    metadata: { method },
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'success',
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'MFA verified successfully',
  });
});

/**
 * @description Setup SMS MFA
 * @POST /api/v1/mfa/sms/setup
 * @access Private
 */
export const setupSMS = AsyncHandler(async (req: Request, res: Response) => {
  const { userId, phoneNumber } = req.body;

  if (!userId || !phoneNumber) {
    throw new BadRequestError('User ID and phone number are required');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new BadRequestError('User not found');
  }

  // Update user phone
  user.phoneNumber = phoneNumber;
  await user.save();

  // Create or update MFA record
  let mfa = await MFA.findOne({ user: userId });
  if (!mfa) {
    mfa = await MFA.create({
      user: userId,
      methods: {
        sms: {
          phoneNumber,
          enabled: false,
        },
        email: { enabled: false },
        totp: { enabled: false, verified: false },
      },
    });
  } else {
    if (!mfa.methods) {
      mfa.methods = {
        sms: { enabled: false },
        email: { enabled: false },
        totp: { enabled: false, verified: false },
      };
    }
    mfa.methods.sms = {
      phoneNumber,
      enabled: false,
    };
    await mfa.save();
  }

  // TODO: Send verification SMS via Twilio or other provider
  // For now, just return success
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'SMS MFA setup initiated. Please verify your phone number.',
  });
});

/**
 * @description Setup Email MFA
 * @POST /api/v1/mfa/email/setup
 * @access Private
 */
export const setupEmail = AsyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    throw new BadRequestError('User ID is required');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new BadRequestError('User not found');
  }

  // Create or update MFA record
  let mfa = await MFA.findOne({ user: userId });
  if (!mfa) {
    mfa = await MFA.create({
      user: userId,
      methods: {
        email: {
          enabled: true,
        },
        sms: { enabled: false },
        totp: { enabled: false, verified: false },
      },
      isEnabled: true,
      preferredMethod: 'email',
    });
  } else {
    if (!mfa.methods) {
      mfa.methods = {
        sms: { enabled: false },
        email: { enabled: false },
        totp: { enabled: false, verified: false },
      };
    }
    mfa.methods.email = {
      enabled: true,
    };
    mfa.isEnabled = true;
    mfa.preferredMethod = 'email';
    await mfa.save();
  }

  // Update user
  await User.findByIdAndUpdate(userId, { mfaEnabled: true });

  await AuditLog.create({
    user: userId,
    event: 'mfa.enabled',
    metadata: { method: 'email' },
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'success',
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Email MFA enabled successfully',
  });
});

/**
 * @description Send MFA code
 * @POST /api/v1/mfa/send-code
 * @access Public
 */
export const sendMFACode = AsyncHandler(async (req: Request, res: Response) => {
  const { userId, method } = req.body;

  if (!userId) {
    throw new BadRequestError('User ID is required');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new BadRequestError('User not found');
  }

  const mfa = await MFA.findOne({ user: userId });
  if (!mfa || !mfa.isEnabled) {
    throw new BadRequestError('MFA not enabled');
  }

  const code = generateCode();

  if (method === 'email' && mfa.methods?.email?.enabled) {
    await SendEmail({
      email: user.email,
      name: user.name,
      subject: 'AuthX - MFA Verification Code',
      message: code,
      category: 'confirmation',
    });
  } else if (method === 'sms' && mfa.methods?.sms?.enabled) {
    // TODO: Send SMS via Twilio or other provider
    // For now, just return success
  } else {
    throw new BadRequestError('Invalid MFA method');
  }

  // Store code temporarily (you might want to use Redis for this)
  // For now, we'll use a session or temporary token

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'MFA code sent successfully',
  });
});

/**
 * @description Disable MFA
 * @POST /api/v1/mfa/disable
 * @access Private
 */
export const disableMFA = AsyncHandler(async (req: Request, res: Response) => {
  const { userId, password } = req.body;

  if (!userId || !password) {
    throw new BadRequestError('User ID and password are required');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new BadRequestError('User not found');
  }

  // Verify password
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthorizedError('Invalid password');
  }

  const mfa = await MFA.findOne({ user: userId });
  if (mfa) {
    mfa.isEnabled = false;
    mfa.methods = {
      sms: { enabled: false },
      email: { enabled: false },
      totp: { enabled: false, verified: false },
    };
    await mfa.save();
  }

  await User.findByIdAndUpdate(userId, { mfaEnabled: false });

  await AuditLog.create({
    user: userId,
    event: 'mfa.disabled',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'success',
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'MFA disabled successfully',
  });
});
