import express from 'express';

import { addDeviceToken, removeDeviceToken } from '../controllers/pushController';
import { primaryLimit } from '../helpers/rateLimits';
import verifyAuth from '../middlewares/verifyAuth';

const router = express.Router();

// auth Routes

router.post('/token', primaryLimit, verifyAuth, addDeviceToken);
router.delete('/token', primaryLimit, verifyAuth, removeDeviceToken);
// router.post('/validate', primaryLimit, validate);
// router.post('/me', primaryLimit, verifyAuth, me);
//
// router.post('/sber/init', primaryLimit, verifyAuth, initSberAuth);
////
export default router;
