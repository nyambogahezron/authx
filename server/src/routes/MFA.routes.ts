import { Router } from 'express';
import {
  setupTOTP,
  verifyTOTP,
  verifyMFA,
  setupSMS,
  setupEmail,
  sendMFACode,
  disableMFA,
} from '../controllers/MFA.controller';

const router = Router();

router.post('/totp/setup', setupTOTP);
router.post('/totp/verify', verifyTOTP);
router.post('/verify', verifyMFA);
router.post('/sms/setup', setupSMS);
router.post('/email/setup', setupEmail);
router.post('/send-code', sendMFACode);
router.post('/disable', disableMFA);

export default router;
