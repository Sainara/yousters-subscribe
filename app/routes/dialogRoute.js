import express from 'express';

import { getDialogs, createDialog, getMessages, createMessage, createOffer, makeWaitFullPay } from '../controllers/dialogsController';
import { connectToDialog } from '../sockets/dialogSocket';
import verifyAuth from '../middlewares/verifyAuth';
import verifyAuthWS from '../middlewares/verifyAuthWS';
import { primaryLimit } from '../helpers/rateLimits';
import {uploader} from '../helpers/s3';

import {
  isLawyer
} from '../helpers/checkers';



var expressWs = require('express-ws')(express.Router());


module.exports = function(app){

  const router = expressWs.app;

  connectToDialog.server = app;
  //console.log(connectToDialog);
  router.ws('/dialog/:uid', verifyAuthWS, connectToDialog);

  //console.log(expressWs);

  router.get('/dialog', primaryLimit, verifyAuth, getDialogs);
  router.post('/dialog', primaryLimit, verifyAuth, createDialog);

  makeWaitFullPay.server = app;
  router.post('/dialog/:uid/waitfullpay', verifyAuth, isLawyer, makeWaitFullPay);



  router.get('/message', primaryLimit, verifyAuth, getMessages);
  createMessage.server = app;
  router.post('/message/:uid/text', verifyAuth, isLawyer, createMessage);
  router.post('/message/:uid/file', verifyAuth, isLawyer, uploader.single('file'), createMessage);

  createOffer.server = app;
  router.post('/offer', verifyAuth, isLawyer, createOffer);


  return router;
};

// Routes

//console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

//export default router;
