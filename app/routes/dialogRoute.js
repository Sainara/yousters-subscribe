import express from 'express';

import { getDialogs, createDialog } from '../controllers/dialogsController';
import verifyAuth from '../middlewares/verifyAuth';
import { primaryLimit } from '../helpers/rateLimits';


const router = express.Router();

// Routes

router.get('/dialog', primaryLimit, verifyAuth, getDialogs);
router.post('/dialog', primaryLimit, verifyAuth, createDialog);

console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

export default router;
