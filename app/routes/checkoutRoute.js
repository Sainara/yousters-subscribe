import express from 'express';

import { renderCheckout, createPayment, checkIAP } from '../controllers/checkoutController';
import verifyAuth from '../middlewares/verifyAuth';
import { primaryLimit } from '../helpers/rateLimits';

const router = express.Router();

router.post('/payment', primaryLimit, verifyAuth, createPayment);
router.get('/checkout/:uid', primaryLimit, renderCheckout);

router.post('/payment/iap', primaryLimit, verifyAuth, checkIAP);
//console.log(uploader);
//router.post('/validate', validate);

export default router;
