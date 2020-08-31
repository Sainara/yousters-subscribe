import express from 'express';

import { subscribtionReport } from '../controllers/reportController';
import { primaryLimit } from '../helpers/rateLimits';
import verifyAuth from '../middlewares/verifyAuth';

//import sendNotification from '../services/notificationService';

const router = express.Router();

// auth Routes

router.post('/report/subscribtion', primaryLimit, verifyAuth, subscribtionReport);
//router.delete('/token', primaryLimit, verifyAuth, removeDeviceToken);

// router.post('/token/test', async (req, res) => {
//   sendNotification('title', 'Activation', 1, {deepLink:"https://you-scribe.ru/profileactivation"});
//   res.send({result : true});
// });

// router.post('/validate', primaryLimit, validate);
// router.post('/me', primaryLimit, verifyAuth, me);
//
// router.post('/sber/init', primaryLimit, verifyAuth, initSberAuth);
////
export default router;
