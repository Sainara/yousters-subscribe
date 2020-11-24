import express from 'express';

import { renderCheckout, createPayment, checkIAP, checkPromoCode } from '../controllers/checkoutController';
import verifyAuth from '../middlewares/verifyAuth';
import { primaryLimit } from '../helpers/rateLimits';

export default router;

var expressWs = require('express-ws')(express.Router());

module.exports = function(app){

  const router = expressWs.app;

  router.post('/payment', primaryLimit, verifyAuth, createPayment);

  renderCheckout.server = app;
  router.get('/checkout/:uid', primaryLimit, renderCheckout);

  router.post('/payment/iap', primaryLimit, verifyAuth, checkIAP);
  router.post('/promocode', primaryLimit, verifyAuth, checkPromoCode);
  
  return router;
};
