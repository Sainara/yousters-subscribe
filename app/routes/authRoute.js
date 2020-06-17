import express from 'express';

import { auth, validate, me } from '../controllers/authController';
import verifyAuth from '../middlewares/verifyAuth';

const router = express.Router();

// auth Routes

router.post('/auth', auth);
router.post('/validate', validate);
router.post('/me', verifyAuth, me);
////
export default router;
