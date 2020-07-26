import express from 'express';

import { getAviablePakets, getMyPaketsAndUsage, usePaket } from '../controllers/paketController';
import verifyAuth from '../middlewares/verifyAuth';
import { primaryLimit } from '../helpers/rateLimits';


const router = express.Router();

// router.post('/payment', verifyAuth, createPayment);
router.get('/pakets', primaryLimit, verifyAuth, getAviablePakets);
router.get('/pakets/my', primaryLimit, verifyAuth, getMyPaketsAndUsage);

router.post('/pakets/use', primaryLimit, verifyAuth, usePaket);

//console.log(uploader);
//router.post('/validate', validate);

export default router;
