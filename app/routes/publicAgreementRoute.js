import express from 'express';

import { renderCase } from '../controllers/publicAgreementController';
// import verifyAuth from '../middlewares/verifyAuth';
// import uploader from '../helpers/s3';

const router = express.Router();
;

router.get('/case/:uid', renderCase)



export default router;
