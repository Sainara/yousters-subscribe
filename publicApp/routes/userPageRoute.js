import express from 'express';

const router = express.Router();

// auth Routes

router.get('/sign', async (req, res) => {
  res.render('pages/web_app/userView/sign');
});

router.get('/general', async (req, res) => {
  res.render('pages/web_app/userView/general');
});
// router.get('/general/add', async (req, res) => {
//   res.render('pages/web_app/general');
// });
//router.post('/validate', primaryLimit, validate);
// router.post('/me', primaryLimit, verifyAuth, me);
// router.post('/token', verifyAuth, addToken);
//
// router.post('/sber/init', primaryLimit, verifyAuth, initSberAuth);
////
export default router;
