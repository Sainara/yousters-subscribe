import express from 'express';

import { uploadAgreement } from '../controllers/agreementsController';
import verifyAuth from '../middlewares/verifyAuth';
import uploader from '../helpers/s3';

const router = express.Router();

// auth Routes

//var cpUpload = uploader.fields([{ name: 'main', maxCount: 1 }, { name: 'secondary', maxCount: 1 }, { name: 'video', maxCount: 1 }])
//router.post('/uploaddocs', verifyAuth, cpUpload, uploadDocs);

router.post('/uploadagreement', verifyAuth, uploader.single('doc'), uploadAgreement);
////
//console.log(uploader);
//router.post('/validate', validate);

export default router;
