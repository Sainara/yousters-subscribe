import express from 'express';

import { renderCheckout } from '../controllers/checkoutController';
// import verifyAuth from '../middlewares/verifyAuth';
// import {uploader} from '../helpers/s3';

const router = express.Router();

router.get('/checkout', renderCheckout);
//console.log(uploader);
//router.post('/validate', validate);

export default router;
