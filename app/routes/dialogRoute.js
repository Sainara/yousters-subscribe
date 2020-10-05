import express from 'express';

import { getDialogs, createDialog, getMessages, createMessage } from '../controllers/dialogsController';
import verifyAuth from '../middlewares/verifyAuth';
import { primaryLimit } from '../helpers/rateLimits';


const router = express.Router();

// Routes

router.get('/dialog', primaryLimit, verifyAuth, getDialogs);
router.post('/dialog', primaryLimit, verifyAuth, createDialog);

router.get('/message', primaryLimit, verifyAuth, getMessages);
router.post('/message', primaryLimit, verifyAuth, getMessages);

//console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

export default router;
