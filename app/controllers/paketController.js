import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import dbQuery from '../db/dbQuery';

import {
  hashPassword,
  isValidEmail,
  isValidINN,
  validatePassword,
  isEmpty,
} from '../helpers/validations';

import {
  generateCode,
  generateUserToken,
  generateFileHash,
} from '../helpers/generators';

import {
  eMessage, sMessage, status,
} from '../helpers/status';

import env from '../../env';

const getAviablePakets = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const selectPaketsQuery = 'SELECT id, title, price, description FROM paketplans WHERE isactive = true ORDER BY price';

  try {
    var { rows } = await dbQuery.query(selectPaketsQuery, []);
    //const dbResponse = rows[0];

    // if (!dbResponse) {
    //   errorMessage.message = "";
    //   return res.status(status.bad).send(errorMessage);
    // }
    //
    // if (dbResponse.isvalidated) {
    //   errorMessage.message = "userValidated";
    //   return res.status(status.bad).send(errorMessage);
    // }
    //
    // if (dbResponse.is_on_validation) {
    //   errorMessage.message = "userOnValidate";
    //   return res.status(status.bad).send(errorMessage);
    // }
    //
    // const updateQuery = 'UPDATE users SET inn = $1, email = $2, main_passport = $3, second_passport = $4, video_passport = $5, is_on_validation = true, validation_type = $6 WHERE id = $7';
    // const values = [inn, email, req.files['main'][0].location, req.files['secondary'][0].location, req.files['video'][0].location, 'phiz', req.user.id]
    // const result = await dbQuery.query(updateQuery, values);

    successMessage.data = rows
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

const getMyPaketsAndUsage = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const selectPaketsQuery = 'SELECT up.paket_id, pp.howmuch, pp.title FROM userpakets as up inner join paketplans as pp on up.paket_id = pp.id WHERE up.user_id = $1';
  const countUsage = 'SELECT COUNT(*) FROM pakets_usage WHERE user_id = $1;'

  const user_id = req.user.id;

  try {
    var { rows } = await dbQuery.query(selectPaketsQuery, [user_id]);

    if (!rows[0]) {
      successMessage.data.packets = rows
      return res.status(status.success).send(successMessage);
    }

    var usage = await dbQuery.query(countUsage, [user_id]);

    successMessage.data.usage = usage.rows[0].count
    successMessage.data.packets = rows
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

// const uploadNonPhizData = async (req, res) => {
//
//   const errorMessage = Object.assign({}, eMessage);
//   const successMessage = Object.assign({}, sMessage);
//
//   const { inn, email } = req.body;
//   const findUserQuery = 'SELECT isvalidated, is_on_validation FROM users WHERE id = $1';
//
//   try {
//     var { rows } = await dbQuery.query(findUserQuery, [req.user.id]);
//     const dbResponse = rows[0];
//
//     if (!dbResponse) {
//       errorMessage.message = "userNotFound";
//       return res.status(status.bad).send(errorMessage);
//     }
//
//     if (dbResponse.isvalidated) {
//       errorMessage.message = "userValidated";
//       return res.status(status.bad).send(errorMessage);
//     }
//
//     if (dbResponse.is_on_validation) {
//       errorMessage.message = "userOnValidate";
//       return res.status(status.bad).send(errorMessage);
//     }
//
//     const updateQuery = 'UPDATE users SET inn = $1, email = $2, is_on_validation = true, validation_type = $3 WHERE id = $4';
//     const values = [inn, email, 'nonPhiz', req.user.id]
//     const result = await dbQuery.query(updateQuery, values);
//
//     return res.status(status.success).send(successMessage);
//   } catch (error) {
//     console.error(error);
//     return res.status(status.bad).send(errorMessage);
//   }
// };

export {
  getAviablePakets,
  getMyPaketsAndUsage
  //uploadNonPhizData
};
