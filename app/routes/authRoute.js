import express from 'express';

import { auth, validate, me, initSberAuth } from '../controllers/authController';
import { primaryLimit, createAccountLimiter } from '../helpers/rateLimits';
import verifyAuth from '../middlewares/verifyAuth';

const router = express.Router();

// auth Routes

router.post('/auth', createAccountLimiter, auth);
router.post('/validate', primaryLimit, validate);
router.post('/me', primaryLimit, verifyAuth, me);

router.post('/sber/init', primaryLimit, verifyAuth, initSberAuth);
////
export default router;
