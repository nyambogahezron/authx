import { Router } from 'express';
import {
  createAPIKey,
  getAllAPIKeys,
  getAPIKeyById,
  updateAPIKey,
  deleteAPIKey,
  rotateAPIKey,
} from '../controllers/APIKey.controller';

const router = Router();

router.post('/', createAPIKey);
router.get('/', getAllAPIKeys);
router.get('/:id', getAPIKeyById);
router.patch('/:id', updateAPIKey);
router.delete('/:id', deleteAPIKey);
router.post('/:id/rotate', rotateAPIKey);

export default router;
