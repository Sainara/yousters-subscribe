import express from 'express';

const router = express.Router();

router.get('/', async (req, res) => {
  res.render('pages/web_app/lawyerView/sign');
});

router.get('/sign', async (req, res) => {
  res.render('pages/web_app/lawyerView/sign');
});

router.get('/general', async (req, res) => {
  res.render('pages/web_app/lawyerView/general');
});

export default router;
