const rateLimit = require("express-rate-limit");

import {
  eMessage, sMessage, status,
} from './status';

eMessage.message = "tooManyRequests";

const primaryLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 250, // start blocking after 150 requests
  message: eMessage
});

const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 3, // start blocking after 3 requests
  message: eMessage
});

export {
  primaryLimit,
  createAccountLimiter
};
