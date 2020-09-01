import express from 'express';

import { renderCase, renderDoc, renderSubVideo } from '../controllers/publicAgreementController';
// import verifyAuth from '../middlewares/verifyAuth';
// import uploader from '../helpers/s3';

const router = express.Router();

router.get('/case/:uid', renderCase)
router.get('/doc/:uid', renderDoc)
router.get('/sub/:uid/video',renderSubVideo)

export default router;
