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
  isAgreementExist
} from '../helpers/checkers';

import {
  eMessage, sMessage, status,
} from '../helpers/status';

import env from '../../env';

const getAviablePakets = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const selectPaketsQuery = 'SELECT id, title, price, description, howmuch FROM paketplans WHERE isactive = true ORDER BY howmuch';

  try {
    var { rows } = await dbQuery.query(selectPaketsQuery, []);

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

  const selectPaketsQuery = 'SELECT pp.howmuch, pp.id, pp.title, pp.price, pp.description FROM userpakets as up inner join paketplans as pp on up.paket_id = pp.id WHERE up.user_id = $1';
  const countUsage = 'SELECT COUNT(*) FROM pakets_usage WHERE user_id = $1;'

  const user_id = req.user.id;

  try {
    var { rows } = await dbQuery.query(selectPaketsQuery, [user_id]);

    if (!rows[0]) {
      successMessage.data.packets = rows
      return res.status(status.success).send(successMessage);
    }

    var usage = await dbQuery.query(countUsage, [user_id]);

    successMessage.data = {usage: '', packets: ''};
    successMessage.data.usage = usage.rows[0].count;
    successMessage.data.packets = rows;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

const usePaket = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const {agr_uid} = req.body;
  const user_id = req.user.id;

  const countPaket = 'SELECT SUM (pp.howmuch) AS total FROM userpakets as up inner join paketplans as pp on up.paket_id = pp.id WHERE up.user_id = $1';
  const countUsage = 'SELECT COUNT(*) FROM pakets_usage WHERE user_id = $1';
  const updateAgreementQuery = 'UPDATE agreements set status_id = 5 WHERE uid = $1';
  const checkIsPaid = 'SELECT status_id FROM agreements WHERE uid = $1';
  const insertUsage = 'INSERT INTO pakets_usage(agr_uid, user_id) VALUES ($1, $2)';

  try {
    var { rows } = await dbQuery.query(countPaket, [user_id]);

    console.log(rows[0].total);
    if (!rows[0].total) {
      errorMessage.message  = "noPakets";
      return res.status(status.bad).send(errorMessage);
    }

    if (!await isAgreementExist(agr_uid)) {
      errorMessage.message = "agreementNotFound";
      return res.status(status.bad).send(errorMessage);
    }

    var cis = await dbQuery.query(checkIsPaid, [agr_uid]);

    if (cis.rows[0].status_id >= 5) {
      errorMessage.message = "alreadyPaid";
      return res.status(status.bad).send(errorMessage);
    }

    var usage = await dbQuery.query(countUsage, [user_id]);

    console.log(rows[0].total);
    console.log(usage.rows[0].count);
    if (rows[0].total > usage.rows[0].count) {
      dbQuery.query(updateAgreementQuery, [agr_uid]);
      dbQuery.query(insertUsage, [agr_uid, user_id]);
      return res.status(status.success).send(successMessage);
    } else {
      errorMessage.message  = "noPakets";
      return res.status(status.bad).send(errorMessage);
    }

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
  getMyPaketsAndUsage,
  usePaket
  //uploadNonPhizData
};
