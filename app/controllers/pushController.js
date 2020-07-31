import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import dbQuery from '../db/dbQuery';

import {
  eMessage, sMessage, status,
} from '../helpers/status';

const addDeviceToken = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);


};

export {
  addDeviceToken
};
