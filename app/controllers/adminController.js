import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import dbQuery from '../db/dbQuery';
import { parsePhoneNumberFromString } from 'libphonenumber-js'

import {
  hashPassword,
  isValidEmail,
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

import {s3delete} from '../helpers/s3';

import sendNotification from '../services/notificationService';

import env from '../../env';

const { gostCrypto, gostEngine } = require('node-gost-crypto');

const listOfUsers = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  //const { inn, email } = req.body;
  //const findUserQuery = 'SELECT isvalidated, is_on_validation FROM users WHERE id = $1';

  try {

    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

const concretUser = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const { id } = req.params;
  const getUserQuery = 'SELECT * from users WHERE id = $1'
  //const findUserQuery = 'SELECT isvalidated, is_on_validation FROM users WHERE id = $1';

  try {

    const { rows } = await dbQuery.query(getUserQuery, [id]);
    const dbResponse = rows[0];

    if (!dbResponse) {
      errorMessage.message = "invalidID";
      return res.status(status.bad).send(errorMessage);
    }

    const results = {
      'user': dbResponse,
    };
    res.render('pages/person/user', results);

    //return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

const validateUser = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const { id } = req.params;
  const { name } = req.body;

  const getUserQuery = 'SELECT * from users WHERE id = $1'
  const updateQuery = 'UPDATE users SET is_on_validation = false, isvalidated = true, user_name = $2 WHERE id = $1';

  try {

    const { rows } = await dbQuery.query(getUserQuery, [id]);
    const dbResponse = rows[0];

    if (!dbResponse) {
      errorMessage.message = "invalidID";
      return res.status(status.bad).send(errorMessage);
    }

    const result = await dbQuery.query(updateQuery, [id, name]);

    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

const deleteUser = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const { id } = req.params;
  const getUserQuery = 'SELECT * from users WHERE id = $1'
  const deleteQuery = 'DELETE FROM users WHERE id = $1'

  try {

    const { rows } = await dbQuery.query(getUserQuery, [id]);
    const dbResponse = rows[0];

    if (!dbResponse) {
      errorMessage.message = "invalidID";
      return res.status(status.bad).send(errorMessage);
    }

    if (dbResponse.is_on_validation || dbResponse.isvalidated) {
      var main_passport = await s3delete(dbResponse.main_passport.split('/').pop())
      var second_passport = await s3delete(dbResponse.second_passport.split('/').pop())
      var video_passport = await s3delete(dbResponse.video_passport.split('/').pop())
    }

    const result = await dbQuery.query(deleteQuery, [id]);

    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

const deleteAgreement = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const { id } = req.params;
  const getUserQuery = 'SELECT * from agreements WHERE id = $1'
  const deleteQuery = 'DELETE FROM agreements WHERE id = $1'

  try {

    const { rows } = await dbQuery.query(getUserQuery, [id]);
    const dbResponse = rows[0];

    if (!dbResponse) {
      errorMessage.message = "invalidID";
      return res.status(status.bad).send(errorMessage);
    }

    var deleteDoc = await s3delete(dbResponse.link.split('/').pop())

    const result = await dbQuery.query(deleteQuery, [id]);

    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

const activatePhiz = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const activateQuery = 'UPDATE users set user_name = $2, isvalidated = true, is_on_validation = false Where id = $1 returning *';

  const {id, name} = req.body

  try {

    await dbQuery.query(activateQuery, [id, name]);
    sendNotification(name, 'Поздравляем! Ваш профиль верифицирован', id, {deepLink:"https://you-scribe.ru/profileactivation", action: "reloadMe"});
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

const dumpvk = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  // const activateQuery = 'UPDATE users set user_name = $2, isvalidated = true, is_on_validation = false Where id = $1 returning *';
  //
  // const {id, name} = req.body

  try {

    //await dbQuery.query(activateQuery, [id, name]);
    //sendNotification(name, 'Поздравляем! Ваш профиль верифицирован', id, {deepLink:"https://you-scribe.ru/profileactivation", action: "reloadMe"});
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

const createLawyer = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const createQuery = 'INSERT INTO lawyers (phone, user_name, email, lawyer_level, uid) VALUES ($1, $2, $3, $4, $5) returning *';

  const { phone, name, email, level } = req.body

  if (!phone) {
    errorMessage.message = "PhoneNumberNotDefined";
    return res.status(status.bad).send(errorMessage);
  }

  const phoneNumber = parsePhoneNumberFromString(phone, 'RU')

  if (!phoneNumber.isValid()) {
    errorMessage.message = "invalidPhoneNumber";
    return res.status(status.bad).send(errorMessage);
  }

  if (!isValidEmail(email)) {
    errorMessage.message = "invalidEmail";
    return res.status(status.bad).send(errorMessage);
  }

  if (!['premium', 'economy', 'profi'].includes(level)) {
    errorMessage.message = "invalidLevel";
    return res.status(status.bad).send(errorMessage);
  }

  var uid = uuidv4();

  var request = require('request');


  var createData = {
    CustomerKey: uid,
    Email: email,
    Phone: phoneNumber.number,
    TerminalKey: env.tnkf_terminal_id
  }
  console.log(createData);

  var concatedVals = uid+email+phoneNumber.number+env.tnkf_terminal_id;
  console.log(concatedVals);

  const buffer = Buffer.from(concatedVals);

  const digest = gostEngine.getGostDigest({name: 'GOST R 34.11', length: 256, version: 1994});
  console.log(Buffer.from(digest.digest(buffer)).toString('BASE64'));



  return res.status(status.success).send(successMessage);


  // request({
  //   url: "https://securepay.tinkoff.ru/e2c/AddCustomer",
  //   method: "POST",
  //   form: {
  //     TerminalKey: env.tnkf_terminal_id,
  //     CustomerKey: uid,
  //     Email: email,
  //     Phone: phoneNumber,
  //     DigestValue: '',
  //     SignatureValue: '',
  //     X509SerialNumber: ''
  //   }
  // }, function (error, response, body){
  //   console.log(body);
  //   if (body.Success) {
  //     console.log(body.PaymentId);
  //     console.log(body.PaymentURL);
  //     dbQuery.query(updatePaymentQuery, [body.PaymentId, dbResponse.uid]);
  //     return res.redirect(body.PaymentURL);
  //   } else {
  //     return res.status(status.success).render('pages/static/errorPage', {Message: body.Message});
  //   }
  // });



  // try {
  //   await dbQuery.query(createQuery, [phoneNumber.number, name, email, level, uid]);
  //   return res.status(status.success).send(successMessage);
  // } catch (error) {
  //   console.error(error);
  //   return res.status(status.bad).send(errorMessage);
  // }
};

export {
  listOfUsers,
  concretUser,
  validateUser,
  deleteUser,
  deleteAgreement,
  activatePhiz,
  createLawyer,
  dumpvk
};
