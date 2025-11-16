import { Router } from 'express';
import {
  createWebhook,
  getAllWebhooks,
  getWebhookById,
  updateWebhook,
  deleteWebhook,
  regenerateSecret,
} from '../controllers/Webhook.controller';
import { requireAdmin } from '../middleware/Authorization';

const router = Router();

// Apply admin middleware to all routes
router.use(requireAdmin);

router.post('/', createWebhook);
router.get('/', getAllWebhooks);
router.get('/:id', getWebhookById);
router.patch('/:id', updateWebhook);
router.delete('/:id', deleteWebhook);
router.post('/:id/regenerate-secret', regenerateSecret);

export default router;
