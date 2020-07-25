import express from 'express';

import { uploadDocs, uploadNonPhizData, renderBill } from '../controllers/docsValidationController';
import verifyAuth from '../middlewares/verifyAuth';
import {uploader} from '../helpers/s3';

const router = express.Router();

var cpUpload = uploader.fields([{ name: 'main', maxCount: 1 }, { name: 'secondary', maxCount: 1 }, { name: 'video', maxCount: 1 }])
router.post('/uploaddocs', verifyAuth, cpUpload, uploadDocs);

router.get('/bill', verifyAuth, renderBill);
router.post('/uploadnonphiz', verifyAuth, uploadNonPhizData);
//console.log(uploader);
//router.post('/validate', validate);

export default router;
