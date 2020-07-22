import express from 'express';

import { auth, validate, me, addToken, initSberAuth } from '../controllers/authController';
import verifyAuth from '../middlewares/verifyAuth';

const router = express.Router();

// auth Routes

router.post('/auth', auth);
router.post('/validate', validate);
router.post('/me', verifyAuth, me);
router.post('/token', verifyAuth, addToken);

router.post('/sber/init', verifyAuth, initSberAuth);
////
export default router;
