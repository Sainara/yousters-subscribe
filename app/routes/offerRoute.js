import express from 'express';

import { getDialogs, getDialog, getOffers, getActiveOffers } from '../controllers/offerController';
import verifyAuth from '../middlewares/verifyAuth';
import {
  isLawyer
} from '../helpers/checkers';

// import { primaryLimit } from '../helpers/rateLimits';


const router = express.Router();

// router.post('/payment', verifyAuth, createPayment);
router.get('/dialog/lawyer', verifyAuth, isLawyer, getDialogs);
router.get('/dialog/:uid/lawyer', verifyAuth, isLawyer, getDialog);


router.get('/offer/lawyer', verifyAuth, isLawyer, getOffers);
router.get('/offer/active/lawyer', verifyAuth, isLawyer, getActiveOffers);

//
// router.get('/pakets/my', primaryLimit, verifyAuth, getMyPaketsAndUsage);
//
// router.post('/pakets/use', primaryLimit, verifyAuth, usePaket);

//console.log(uploader);
//router.post('/validate', validate);

export default router;
