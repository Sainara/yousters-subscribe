import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import dbQuery from '../db/dbQuery';

import {
  eMessage, sMessage, status,
} from '../helpers/status';

const addDeviceToken = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const addQuery = 'INSERT INTO device_tokens (user_id, device_type, token) VALUES ($1, $2, $3)';
  const updateTokenOwner = 'UPDATE device_tokens SET user_id = $2 WHERE token = $1';
  const updateUsersToken = 'UPDATE device_tokens SET token = $2 WHERE user_id = $1';
  const checkquery = 'SELECT * FROM device_tokens WHERE token = $1';
  const checkUser = 'SELECT * FROM device_tokens WHERE user_id = $1 AND device_type = $2';

  const { type, deviceToken } = req.body;

  try {

    console.log(type);
    console.log(!(type == "ios" || type == "android"));

    if (!(type == "ios" || type == "android")) {
      errorMessage.message = "invalidType";
      return res.status(status.bad).send(errorMessage);
    }



    const check = await dbQuery.query(checkquery, [deviceToken]);
    const dbResponse = check.rows[0];

    if (dbResponse) {
      if (dbResponse.user_id == req.user.id) {
        return res.status(status.success).send(successMessage);
      } else {
        await dbQuery.query(updateTokenOwner, [deviceToken, req.user.id]);
        return res.status(status.success).send(successMessage);
      }
    }

    const userCheck = await dbQuery.query(checkUser, [req.user.id, type]);
    const userCheckdbResponse = userCheck.rows[0];

    if (userCheckdbResponse) {
        await dbQuery.query(updateUsersToken, [req.user.id, deviceToken]);
        return res.status(status.success).send(successMessage);
    }

    const values = [req.user.id, type, deviceToken];
    await dbQuery.query(addQuery, values);

    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

const removeDeviceToken = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const checkquery = 'SELECT * FROM device_tokens WHERE user_id = $1 AND device_type = $2';
  const removeQuery = 'DELETE FROM device_tokens WHERE user_id = $1 AND device_type = $2';

  const { type } = req.body;

  try {

    if (!(type == "ios" || type == "android")) {
      errorMessage.message = "invalidType";
      return res.status(status.bad).send(errorMessage);
    }

    const check = await dbQuery.query(checkquery, [req.user.id, type]);
    const dbResponse = check.rows[0];

    if (dbResponse) {
      await dbQuery.query(removeQuery, [req.user.id, deviceToken]);
      return res.status(status.success).send(successMessage);
    }

    errorMessage.message = "invalidToken";
    return res.status(status.bad).send(errorMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

export {
  addDeviceToken,
  removeDeviceToken
};
