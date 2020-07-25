import express from 'express';

import { getAviablePakets } from '../controllers/paketController';
import verifyAuth from '../middlewares/verifyAuth';

const router = express.Router();

// router.post('/payment', verifyAuth, createPayment);
router.get('/pakets', verifyAuth, getAviablePakets);
//console.log(uploader);
//router.post('/validate', validate);

export default router;
