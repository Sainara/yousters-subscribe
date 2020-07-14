import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import dbQuery from '../db/dbQuery';

import {
  hashPassword,
  isValidEmail,
  validatePassword,
  isEmpty,
} from '../helpers/validations';

import {
  isAgreementExist
} from '../helpers/checkers';

import {
  errorMessage, successMessage, status,
} from '../helpers/status';

const createPayment = async (req, res) => {

  const { agr_uid } = req.body;

  const checkExistQuery = 'SELECT uid FROM payments WHERE agr_uid = $1';
  const createQuery = 'INSERT INTO payments (uid, user_id, agr_uid, amount, created_at) VALUES ($1, $2, $3, $4, $5) returning uid';

  try {
    if (!await isAgreementExist(agr_uid)) {
      errorMessage.message = "agreementNotFound";
      return res.status(status.bad).send(errorMessage);
    }

    var check = await dbQuery.query(checkExistQuery, [agr_uid]);
    const dbResponse = check.rows[0];

    if (dbResponse) {
      successMessage.uid = dbResponse.uid;
      return res.status(status.success).send(successMessage);
    }

    const values = [uuidv4(), req.user.id, agr_uid, '39.00', moment()];
    const {rows} = await dbQuery.query(createQuery, values);

    successMessage.uid = rows[0].uid;
    return res.status(status.success).send(successMessage);

  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

const renderCheckout = async (req, res) => {

  const { uid } = req.params;

  const getQuery = 'SELECT * FROM agreements WHERE uid = $1';
  const getSubsQuery = 'SELECT s.created_at, u.inn, u.phone, u.user_name FROM subscribtion as s inner join users as u on s.subs_id = u.id WHERE s.agr_uid = $1';

  try {

    var return_url = "confirmation_token"
    const result = {
      confirmation_token: return_url,
      return_url: return_url,
     };
    res.render('pages/yandexCheckout', result);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

export {
  createPayment,
  renderCheckout
};
