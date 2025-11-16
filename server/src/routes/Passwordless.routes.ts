import { Router } from 'express';
import {
  requestMagicLink,
  verifyMagicLink,
  requestPhoneOTP,
  verifyPhoneOTP,
} from '../controllers/Passwordless.controller';
import { emailVerificationLimiter } from '../middleware/RateLimiter';

const router = Router();

router.post('/magic-link/request', emailVerificationLimiter, requestMagicLink);
router.post('/magic-link/verify', verifyMagicLink);
router.post('/phone/request-otp', emailVerificationLimiter, requestPhoneOTP);
router.post('/phone/verify-otp', verifyPhoneOTP);

export default router;
