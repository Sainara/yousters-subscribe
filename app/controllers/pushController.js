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
  const checkquery = 'SELECT * FROM device_tokens WHERE token = $1';

  const { type, deviceToken } = req.body;

  try {

    if (!(type == "ios" || type == "android")) {
      errorMessage.message = "invalidType";
      return res.status(status.bad).send(errorMessage);
    }

    const check = await dbQuery.query(checkquery, [token]);
    const dbResponse = check.rows[0];

    if (dbResponse) {
      return res.status(status.success).send(successMessage);
    }

    const values = [req.user.id, type, token];
    const { rows } = await dbQuery.query(addQuery, values);

    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

export {
  addDeviceToken
};
