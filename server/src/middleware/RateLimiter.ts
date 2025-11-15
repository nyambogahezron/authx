import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for authentication endpoints
 * Prevents brute force attacks by limiting login attempts
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for general API endpoints
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for password reset
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: 'Too many password reset attempts, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for email verification resend
 */
export const emailVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 resend requests per 15 minutes
  message: 'Too many verification code requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
