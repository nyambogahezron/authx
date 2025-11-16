import { Router } from 'express';
import {
  getAllSessions,
  revokeSession,
  revokeAllSessions,
  trustDevice,
  getSessionActivity,
} from '../controllers/Session.controller';

const router = Router();

router.get('/', getAllSessions);
router.get('/activity', getSessionActivity);
router.delete('/:sessionId', revokeSession);
router.post('/revoke-all', revokeAllSessions);
router.post('/:sessionId/trust', trustDevice);

export default router;
