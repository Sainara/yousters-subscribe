import express from 'express';

const router = express.Router();

router.get('/user-agreement', (req, res) =>
  res.render('pages/static/legal/user-agreement/user-agreement', {page_title: "Лицензионное соглашение"})
);
router.get('/termsofuse', (req, res) =>
  res.render('pages/static/legal/termsofuse/termsofuse', {page_title: "Условия использования"})
);
router.get('/confidential', (req, res) =>
  res.render('pages/static/legal/confidential/confidential', {page_title: "Политика конфиденциальности"})
);

export default router;
