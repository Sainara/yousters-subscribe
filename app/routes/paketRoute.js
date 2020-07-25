import express from 'express';

import { selectPaketsQuery } from '../controllers/paketController';
import verifyAuth from '../middlewares/verifyAuth';

const router = express.Router();

// router.post('/payment', verifyAuth, createPayment);
router.get('/pakets', verifyAuth, selectPaketsQuery);
//console.log(uploader);
//router.post('/validate', validate);

export default router;
