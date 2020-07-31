import express from 'express';

import { addDeviceToken, removeDeviceToken } from '../controllers/pushController';
import { primaryLimit } from '../helpers/rateLimits';
import verifyAuth from '../middlewares/verifyAuth';

import sendNotification from '../services/notificationService';

const router = express.Router();

// auth Routes

router.post('/token', primaryLimit, verifyAuth, addDeviceToken);
router.delete('/token', primaryLimit, verifyAuth, removeDeviceToken);

router.post('token/test', async (req, res) => {
  sendNotification('title', 'body', 1, {});
  res.send({result : true});
});

// router.post('/validate', primaryLimit, validate);
// router.post('/me', primaryLimit, verifyAuth, me);
//
// router.post('/sber/init', primaryLimit, verifyAuth, initSberAuth);
////
export default router;
