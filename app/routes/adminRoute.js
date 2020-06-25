import express from 'express';

import { listOfUsers, concretUser, deleteUser } from '../controllers/adminController';
import verifyAuth from '../middlewares/verifyAuth';

const router = express.Router();

// auth Routes

router.get('/list', listOfUsers);
router.get('/person/:id', concretUser);

router.delete('/person/:id', deleteUser);

// router.post('/validate', validate);
// router.post('/me', verifyAuth, me);
// router.post('/token', verifyAuth, addToken);
////
export default router;