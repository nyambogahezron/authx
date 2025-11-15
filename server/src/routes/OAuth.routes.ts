import { Router } from 'express';
import {
  googleAuth,
  googleCallback,
  facebookAuth,
  facebookCallback,
  githubAuth,
  githubCallback,
  linkedinAuth,
  linkedinCallback,
} from '../controllers/OAuth.controller';

const router = Router();

// Google OAuth
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Facebook OAuth
router.get('/facebook', facebookAuth);
router.get('/facebook/callback', facebookCallback);

// GitHub OAuth
router.get('/github', githubAuth);
router.get('/github/callback', githubCallback);

// LinkedIn OAuth
router.get('/linkedin', linkedinAuth);
router.get('/linkedin/callback', linkedinCallback);

export default router;
