import jwt from 'jsonwebtoken';
import {
  errorMessage, status,
} from '../helpers/status';

import env from '../../env';

/**
   * Verify Token
   * @param {object} req
   * @param {object} res
   * @param {object} next
   * @returns {object|void} response object
   */

const verifyToken = async (req, res, next) => {
  //console.log(req.headers);
  const { token } = req.headers;
  if (!token) {
    errorMessage.error = 'Token not provided';
    return res.status(status.bad).send(errorMessage);
  }
  try {
    const decoded =  jwt.verify(token, env.secret);

    req.user = {
      id: decoded.id,
      phone: decoded.phone,
      isvalidated: decoded.isvalidated,
    };
    console.log(req.user);
    next();
  } catch (error) {
    console.error(error);
    errorMessage.error = 'Authentication Failed';
    return res.status(status.unauthorized).send(errorMessage);
  }
};
//
export default verifyToken;
