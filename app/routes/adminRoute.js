import express from 'express';

import { listOfUsers, concretUser, validateUser, deleteUser, deleteAgreement, activatePhiz, createLawyer } from '../controllers/adminController';
import verifyAuth from '../middlewares/verifyAuth';

const router = express.Router();

// auth Routes

router.get('/list', listOfUsers);
router.get('/person/:id', concretUser);

router.delete('/person/:id', deleteUser);
router.post('/person/:id', validateUser);

router.delete('/agreement/:id', deleteAgreement);

router.post('/activate', activatePhiz);

router.post('/lawyer', createLawyer);

// router.post('/validate', validate);
// router.post('/me', verifyAuth, me);
// router.post('/token', verifyAuth, addToken);
////
export default router;
