import express from 'express';

import { getAviablePakets } from '../controllers/paketController';
import verifyAuth from '../middlewares/verifyAuth';
import { primaryLimit } from '../helpers/rateLimits';


const router = express.Router();

// router.post('/payment', verifyAuth, createPayment);
router.get('/pakets', primaryLimit, verifyAuth, getAviablePakets);
//console.log(uploader);
//router.post('/validate', validate);

export default router;
