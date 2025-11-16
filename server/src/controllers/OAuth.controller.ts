import { Request, Response } from 'express';
import passport from 'passport';
import crypto from 'crypto';
import AsyncHandler from '../middleware/AsyncHandler';
import Session from '../models/Session.model';
import AuditLog from '../models/AuditLog.model';
import { parseDeviceInfo } from '../utils/DeviceFingerprint';
import attachCookieToResponse from '../utils/JWT';
import { UserProps } from '../types';

/**
 * @description Google OAuth login
 * @GET /api/v1/auth/google
 * @access Public
 */
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

/**
 * @description Google OAuth callback
 * @GET /api/v1/auth/google/callback
 * @access Public
 */
export const googleCallback = [
  passport.authenticate('google', { failureRedirect: '/login' }),
  AsyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    
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
      metadata: { provider: 'google' },
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

    // Redirect to frontend
    res.redirect(`${process.env.CLIENT_URL}/auth/success`);
  }),
];

/**
 * @description Facebook OAuth login
 * @GET /api/v1/auth/facebook
 * @access Public
 */
export const facebookAuth = passport.authenticate('facebook', {
  scope: ['email'],
});

/**
 * @description Facebook OAuth callback
 * @GET /api/v1/auth/facebook/callback
 * @access Public
 */
export const facebookCallback = [
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  AsyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    
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

    await AuditLog.create({
      user: user._id,
      event: 'user.login',
      metadata: { provider: 'facebook' },
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
    res.redirect(`${process.env.CLIENT_URL}/auth/success`);
  }),
];

/**
 * @description GitHub OAuth login
 * @GET /api/v1/auth/github
 * @access Public
 */
export const githubAuth = passport.authenticate('github', {
  scope: ['user:email'],
});

/**
 * @description GitHub OAuth callback
 * @GET /api/v1/auth/github/callback
 * @access Public
 */
export const githubCallback = [
  passport.authenticate('github', { failureRedirect: '/login' }),
  AsyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    
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

    await AuditLog.create({
      user: user._id,
      event: 'user.login',
      metadata: { provider: 'github' },
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
    res.redirect(`${process.env.CLIENT_URL}/auth/success`);
  }),
];

/**
 * @description LinkedIn OAuth login
 * @GET /api/v1/auth/linkedin
 * @access Public
 */
export const linkedinAuth = passport.authenticate('linkedin');

/**
 * @description LinkedIn OAuth callback
 * @GET /api/v1/auth/linkedin/callback
 * @access Public
 */
export const linkedinCallback = [
  passport.authenticate('linkedin', { failureRedirect: '/login' }),
  AsyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    
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

    await AuditLog.create({
      user: user._id,
      event: 'user.login',
      metadata: { provider: 'linkedin' },
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
    res.redirect(`${process.env.CLIENT_URL}/auth/success`);
  }),
];
