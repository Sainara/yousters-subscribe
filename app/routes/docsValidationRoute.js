import express from 'express';

import { uploadDocs, uploadNonPhizData } from '../controllers/docsValidationController';
import verifyAuth from '../middlewares/verifyAuth';
import {uploader} from '../helpers/s3';

const router = express.Router();

// auth Routes

var cpUpload = uploader.fields([{ name: 'main', maxCount: 1 }, { name: 'secondary', maxCount: 1 }, { name: 'video', maxCount: 1 }])
router.post('/uploaddocs', verifyAuth, cpUpload, uploadDocs);

router.post('/uploadnonphiz', verifyAuth, uploadNonPhizData);
//console.log(uploader);
//router.post('/validate', validate);

export default router;
