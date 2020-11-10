import express from 'express';

import { errorDepositionNotification } from '../controllers/repaimentController';
import { primaryLimit } from '../helpers/rateLimits';
import verifyAuth from '../middlewares/verifyAuth';

//import sendNotification from '../services/notificationService';

const router = express.Router();

router.post('/repaiment/errordeposition', errorDepositionNotification);

export default router;
