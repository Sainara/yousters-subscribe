import jwt from 'jsonwebtoken';
import {
  eMessage, status,
} from '../helpers/status';

import env from '../../env';

/**
   * Verify Token
   * @param {object} req
   * @param {object} res
   * @param {object} next
   * @returns {object|void} response object
   */

const verifyTokenWS = async (ws, req, next) => {

  const errorMessage = Object.assign({}, eMessage);

  console.log(req.headers);
  const token = req.headers.token || req.query.token;
  if (!token) {
    console.log('destroy');
    ws._socket.destroy();
    return;
    //ws.destroy();
  }
  try {
    const decoded = jwt.verify(token, env.secret);

    req.user = {
      id: decoded.id,
      phone: decoded.phone,
      isvalidated: decoded.isvalidated,
    };
    console.log(req.user);
    next();
  } catch (error) {
    console.log('destroy');
    ws._socket.destroy();
    return;
  }
};
//
export default verifyTokenWS;
