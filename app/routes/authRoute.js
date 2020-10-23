import express from 'express';

import { auth, validate, validateLawyer,  me, meLawyer, initSberAuth } from '../controllers/authController';
import { primaryLimit, createAccountLimiter } from '../helpers/rateLimits';
import verifyAuth from '../middlewares/verifyAuth';

const router = express.Router();

// auth Routes

router.post('/auth', createAccountLimiter, auth);
router.post('/validate', primaryLimit, validate);
router.post('/validatelawyer', primaryLimit, validateLawyer);
router.post('/me', primaryLimit, verifyAuth, me);
router.post('/melawyer', primaryLimit, verifyAuth, meLawyer);

router.post('/sber/init', primaryLimit, verifyAuth, initSberAuth);
////
export default router;
