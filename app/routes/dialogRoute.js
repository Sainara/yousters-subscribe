import express from 'express';

import { getDialogs, createDialog, getMessages, createMessage } from '../controllers/dialogsController';
import { connectToDialog } from '../sockets/dialogSocket';
import verifyAuth from '../middlewares/verifyAuth';
import verifyAuthWS from '../middlewares/verifyAuthWS';
import { primaryLimit } from '../helpers/rateLimits';



var expressWs = require('express-ws')(express.Router());


module.exports = function(app){

  const router = expressWs.app;
  console.log("ROUTER app");
  console.log(app);
  connectToDialog.server = app;
  //console.log(connectToDialog);
  router.ws('/dialog/:uid', verifyAuthWS, connectToDialog);

  //console.log(expressWs);

  router.get('/dialog', primaryLimit, verifyAuth, getDialogs);
  router.post('/dialog', primaryLimit, verifyAuth, createDialog);



  router.get('/message', primaryLimit, verifyAuth, getMessages);
  router.post('/message', primaryLimit, verifyAuth, createMessage);


    return router;
};

// Routes

//console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

//export default router;
