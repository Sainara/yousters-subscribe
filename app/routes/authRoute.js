import express from 'express';

import { auth, validate } from '../controllers/authController';
//import verifyAuth from '../middlewares/verifyAuth';

const router = express.Router();

// auth Routes

router.post('/auth', auth);
router.post('/validate', validate);

export default router;
