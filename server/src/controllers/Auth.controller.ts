import { Request, Response } from 'express';
import crypto from 'crypto';
import AsyncHandler from '../middleware/AsyncHandler';
import User from '../models/User.model';
import Token from '../models/Token.model';
import Session from '../models/Session.model';
import AuditLog from '../models/AuditLog.model';
import { BadRequestError, UnauthorizedError } from '../errors';
import { generateCode } from '../utils/GenerateCode';
import { StatusCodes } from 'http-status-codes';
import attachCookieToResponse from '../utils/JWT';
import CreateHash from '../utils/CreateHash';
import { UserProps } from '../types';
import SendEmail from '../utils/SendEmail';
import { parseDeviceInfo } from '../utils/DeviceFingerprint';

/**
 *@description Register User
 *@POST /api/v1/auth/register
 *@access Public
 */

export const RegisterUser = AsyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new BadRequestError('Please provide all fields');
    }

    // check if user exists
    const emailExists = await User.findOne({ email }).select('-password');

    if (emailExists) {
      throw new BadRequestError('Email already exists');
    }

    const verificationToken = generateCode();

    await SendEmail({
      email,
      name,
      subject: 'AuthX - Email Verification',
      message: verificationToken,
      category: 'confirmation',
    });

    const user = await User.create({
      name,
      email,
      password,
      verificationToken,
    });

    // Log signup event
    await AuditLog.create({
      user: user._id,
      event: 'user.signup',
      metadata: { method: 'email' },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success',
    });

    user.set('password', undefined, { strict: false });
    res.status(StatusCodes.CREATED).json({ success: true, data: user });
  }
);

/**
 *@description Verify Email
 *@GET /api/v1/auth/verify-email
 *@access Public
 */

export const VerifyEmail = AsyncHandler(async (req: Request, res: Response) => {
  const { verificationToken, email } = req.body;

  if (!verificationToken || !email) {
    throw new BadRequestError('A verification token and email are required');
  }

  const user = await User.findOne({ email, verificationToken });

  if (!user) {
    throw new BadRequestError('Invalid verification token');
  }

  if (user.isVerified) {
    throw new BadRequestError('Email already verified');
  }

  if (user.verificationToken !== verificationToken) {
    throw new BadRequestError('Invalid verification token');
  }

  user.isVerified = true;
  user.verificationToken = '';

  await user.save();

  res
    .status(StatusCodes.OK)
    .json({ success: true, message: 'Email verified successfully' });
});

/**
 *@description Resend Verification Email
 *@POST /api/v1/auth/resend-verification
 *@access Public
 */

export const ResendVerificationCode = AsyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      throw new BadRequestError('Please provide an email');
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new BadRequestError('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestError('Email already verified');
    }

    const verificationToken = generateCode();

    user.verificationToken = verificationToken;

    await user.save();

    await SendEmail({
      email: user.email,
      name: user.name,
      subject: 'Comfy Store - Email Verification',
      message: verificationToken,
      category: 'confirmation',
    });

    res
      .status(StatusCodes.OK)
      .json({ success: true, message: 'Verification code sent successfully' });
  }
);

/**
 *@description Login User
 *@POST /api/v1/auth/login
 *@access Public
 */
export const LoginUser = AsyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Please provide an email and password');
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Check if account is locked
  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new UnauthorizedError('Account is temporarily locked. Please try again later');
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    // Increment login attempts
    user.loginAttempts = (user.loginAttempts || 0) + 1;
    
    // Lock account after 5 failed attempts
    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      await user.save();
      
      // Log failed login
      await AuditLog.create({
        user: user._id,
        event: 'failed.login',
        metadata: { reason: 'account_locked', attempts: user.loginAttempts },
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'failure',
      });
      
      throw new UnauthorizedError('Too many failed login attempts. Account locked for 15 minutes');
    }
    
    await user.save();
    
    // Log failed login
    await AuditLog.create({
      user: user._id,
      event: 'failed.login',
      metadata: { reason: 'invalid_password', attempts: user.loginAttempts },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'failure',
    });
    
    throw new UnauthorizedError('Username or password is incorrect');
  }

  if (!user.isVerified) {
    throw new UnauthorizedError('Email not verified');
  }

  // Check if account is suspended
  if (user.accountStatus === 'suspended') {
    throw new UnauthorizedError('Account is suspended');
  }

  // Reset login attempts on successful login
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLogin = new Date();
  user.lastLoginIp = req.ip || 'unknown';
  await user.save();

  const tokenObj: UserProps = {
    userId: user._id,
    name: user.name,
    email: user.email,
  };
  
  let refreshToken = '';
  const deviceInfo = parseDeviceInfo(req);

  // Check if user has an active session from this device
  const existingSession = await Session.findOne({
    user: user._id,
    deviceFingerprint: deviceInfo.fingerprint,
    isActive: true,
  });

  if (existingSession) {
    // Update existing session
    existingSession.lastActivity = new Date();
    existingSession.ip = deviceInfo.ip;
    existingSession.userAgent = deviceInfo.userAgent;
    await existingSession.save();
    
    refreshToken = existingSession.token;
  } else {
    // Create new session
    refreshToken = crypto.randomBytes(40).toString('hex');
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
  }

  // Log successful login
  await AuditLog.create({
    user: user._id,
    event: 'user.login',
    metadata: { method: 'password' },
    ip: deviceInfo.ip,
    userAgent: deviceInfo.userAgent,
    status: 'success',
  });

  attachCookieToResponse({ res, user: tokenObj, token: refreshToken });

  res.status(StatusCodes.OK).json({ user: tokenObj });
});

/**
 * @description Forgot Password
 * @POST /api/v1/auth/forgot-password
 * @access Public
 */

export const ForgotPassword = AsyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      throw new BadRequestError('Please provide an email');
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new BadRequestError('User not found');
    }

    const resetToken = generateCode();
    const tenMinutes = 10 * 60 * 1000;
    const passwordResetExpires = Date.now() + tenMinutes;

    user.passwordToken = CreateHash(resetToken);
    user.passwordTokenExpires = new Date(passwordResetExpires);

    await user.save();

    res
      .status(StatusCodes.OK)
      .json({ success: true, message: 'Reset token sent successfully' });
  }
);

/**
 * @description Reset Password
 * @POST /api/v1/auth/reset-password
 * @access Public
 */

export const ResetPassword = AsyncHandler(
  async (req: Request, res: Response) => {
    const { token, email, password } = req.body;

    if (!token || !email || !password) {
      throw new BadRequestError('Please provide all fields');
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new BadRequestError('User not found');
    }

    const currentTime = Date.now();
    const hashedToken = CreateHash(token);

    if (user.passwordToken !== hashedToken) {
      throw new BadRequestError('Invalid token');
    }

    if (
      !user.passwordTokenExpires ||
      currentTime > user.passwordTokenExpires.getTime()
    ) {
      throw new BadRequestError('Token expired');
    }

    user.password = password;
    user.passwordToken = '';
    user.passwordTokenExpires = undefined;

    await user.save();

    res
      .status(StatusCodes.OK)
      .json({ success: true, message: 'Password reset successfully' });
  }
);

/**
 *@description logout user
 *@DELETE /api/v1/auth/logout
 * @access Private
 */
export const LogoutUser = AsyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body;
  await Token.findOneAndDelete({ user: userId });

  res.cookie('accessToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie('refreshToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
});
