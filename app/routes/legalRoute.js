import express from 'express';

const router = express.Router();

router.get('/user-agreement', (req, res) => res.render('pages/static/legal/user-agreement/user-agreement'));
router.get('/termsofuse', (req, res) => res.render('pages/static/legal/termsofuse/termsofuse'));
router.get('/confidential', (req, res) => res.render('pages/static/legal/confidential/confidential'));


export default router;
