import express from 'express';

const router = express.Router();

router.get('/user-agreement', (req, res) =>
  res.render('pages/legal/user-agreement/user-agreement', {page_title: "Лицензионное соглашение для мобильных устройств"})
);
router.get('/user-agreement/web', (req, res) =>
  res.render('pages/legal/user-agreement/user-agreement-web', {page_title: "Лицензионное соглашение для веб-приложения"})
);
router.get('/termsofuse', (req, res) =>
  res.render('pages/legal/termsofuse/termsofuse', {page_title: "Условия использования"})
);
router.get('/confidential', (req, res) =>
  res.render('pages/legal/confidential/confidential', {page_title: "Политика конфиденциальности"})
);
router.get('/faq', async (req, res) => {
  res.render('pages/legal/faq/faq', { page_title: "F.A.Q." });
});

export default router;
