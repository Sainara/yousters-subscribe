import express from 'express';

import { renderCheckout, createPayment } from '../controllers/checkoutController';
import verifyAuth from '../middlewares/verifyAuth';
// import {uploader} from '../helpers/s3';

const router = express.Router();

router.post('/payment', verifyAuth, createPayment);
router.get('/checkout/:uid', renderCheckout);
//console.log(uploader);
//router.post('/validate', validate);

export default router;
