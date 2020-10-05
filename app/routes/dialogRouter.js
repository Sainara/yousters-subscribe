import express from 'express';

import { getDialogs, createDialog } from '../controllers/dialogsController';
import verifyAuth from '../middlewares/verifyAuth';
import { primaryLimit } from '../helpers/rateLimits';


const router = express.Router();

// Routes

router.get('/dialog', primaryLimit, verifyAuth, getDialogs);
router.post('/dialog', primaryLimit, verifyAuth, createDialog);


// router.post('/validate', validate);
// router.post('/me', verifyAuth, me);
// router.post('/token', verifyAuth, addToken);
////
export default router;
