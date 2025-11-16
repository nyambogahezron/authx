import { Router } from 'express';

import {
  RegisterUser,
  LoginUser,
  LogoutUser,
  VerifyEmail,
  ResendVerificationCode,
  ResetPassword,
  ForgotPassword,
} from '../controllers/Auth.controller';
import {
  authLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
} from '../middleware/RateLimiter';

const router = Router();

router.post('/register', RegisterUser);

router.post('/login', authLimiter, LoginUser);

router.delete('/logout', LogoutUser);

router.post('/verify-email', VerifyEmail);

router.post('/resend-verification', emailVerificationLimiter, ResendVerificationCode);

router.post('/forgot-password', passwordResetLimiter, ForgotPassword);

router.post('/reset-password', ResetPassword);

export default router;
