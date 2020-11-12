import express from 'express';

const router = express.Router();

router.get('/user-agreement', (req, res) =>
  res.render('pages/legal/user-agreement/user-agreement', {page_title: "Лицензионное соглашение для мобильных устройств"})
);
router.get('/user-agreement/web', (req, res) =>
  res.render('pages/legal/user-agreement/user-agreement-web', {page_title: "Лицензионное соглашение для веб-приложения"})
);
router.get('/user-agreement/forlawyer', (req, res) =>
  res.render('pages/legal/user-agreement/user-agreement-lawyers', {page_title: "Лицензионное соглашение для веб-приложения для юристов"})
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
router.get('/faq/documentservice', async (req, res) => {
  res.render('pages/legal/faq/documentservice', { page_title: "F.A.Q. - Сервис договоров" });
});

export default router;
