import express from 'express';

//import { renderSignPage } from '../controllers/signController';
// import { primaryLimit, createAccountLimiter } from '../helpers/rateLimits';
// import verifyAuth from '../middlewares/verifyAuth';

const router = express.Router();

// auth Routes

router.get('/general', async (req, res) => {
  res.render('pages/web_app/general');
});
//router.post('/validate', primaryLimit, validate);
// router.post('/me', primaryLimit, verifyAuth, me);
// router.post('/token', verifyAuth, addToken);
//
// router.post('/sber/init', primaryLimit, verifyAuth, initSberAuth);
////
export default router;
