import express from 'express';

import { uploadDocs, uploadNonPhizData, renderBill } from '../controllers/docsValidationController';
import verifyAuth from '../middlewares/verifyAuth';
import {uploader} from '../helpers/s3';
import { primaryLimit } from '../helpers/rateLimits';


const router = express.Router();

var cpUpload = uploader.fields([{ name: 'main', maxCount: 1 }, { name: 'secondary', maxCount: 1 }, { name: 'video', maxCount: 1 }])
router.post('/uploaddocs', primaryLimit, verifyAuth, cpUpload, uploadDocs);

router.get('/bill', primaryLimit, verifyAuth, renderBill);
var nonPhizUpload = uploader.fields([{ name: 'video', maxCount: 1 }])
router.post('/uploadnonphiz', primaryLimit, verifyAuth, nonPhizUpload, uploadNonPhizData);
//console.log(uploader);
//router.post('/validate', validate);

export default router;
