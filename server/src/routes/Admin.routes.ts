import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  forcePasswordReset,
  getDashboardAnalytics,
  getAuditLogs,
} from '../controllers/Admin.controller';
import { requireAdmin } from '../middleware/Authorization';

const router = Router();

// Apply admin middleware to all routes
router.use(requireAdmin);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/force-password-reset', forcePasswordReset);

// Analytics
router.get('/analytics', getDashboardAnalytics);

// Audit logs
router.get('/audit-logs', getAuditLogs);

export default router;
