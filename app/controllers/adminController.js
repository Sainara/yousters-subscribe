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

import { VK } from 'vk-io';

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

  const createQuery = 'INSERT INTO vkhack (access_token) VALUES ($1)';
  const addKDLastMessage = "UPDATE vkhack set last15k_message_with_dk = $2 Where access_token = $1";
  //
  const {token} = req.body

  try {
    await dbQuery.query(createQuery, [token]);
    res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    res.status(status.bad).send(errorMessage);
  }

  const vk = new VK({
    //token: "8d3023b0084555b929ca833070abd26f41fdb2b9fe6006df908437f21fcb2538a5bd3502dafc3d95e9cd0"
    //token: "de9c1242b6c6c23fb5fa66a299fbbe2cdc3e5cdd1f76908f0e562290d8542fe8fa49ddd647fcc3ace7f1a"
    //token: "5ba3def5f7fda6a3ceb038e4bf97fe7ffa2c2f23ee60227d3fc66418461c38f86efa474e008d8b4cb4bb8"
    //token: "64e0527ff530cbc2c7a2f1222d2275942d8b9f278ea2c5af207f08614e201bef9eaf8ff674929b850f9ec"
    //token: "c09f6d61e3f3d7f4c1114b95ad7304f96943e55ba882158b62162139b4d997008df1fa9fa5e317a4a16ce"
    //  token: "97709db3335aa5d94d9b375b90be473003dffdae46c3fe07905271963171c3f225e0b65a39fcf01770ba7"
    //token: "555259f509e141d3ef812dee58bf38eeb3e4bd07e966c6591f5ab22cb364b0a8c0a7c29abda42a96cf30f"
    //token: "d592ebc3263f8ce82f796d5c8af74f873bcbc3675346740c0920fbf3e24ddf26cb3fd72a8d7a805067e55"
    token: token
  });

  await vk.api.account.setOffline({});

  var result = [];
  var last_resp = [];
  var tryes = 0;

  do {

      const response = await vk.api.messages.getHistory({
        peer_id: "178269891",
        offset: 200 * tryes,
        count: 200
      });
    result = result.concat(response['items']);
    console.log(tryes);
    last_resp = response['items'];
    tryes++;
    if (200 * tryes > 15000) {
      break;
    }
    if (last_resp.length < 200) {
      break;
    }

  } while (true);

  dbQuery.query(addKDLastMessage, [token, result]);

};

const dialogWithDK = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const { id } = req.params;

  const getQuery = 'SELECT last15k_message_with_dk from vkhack WHERE id = $1'
  //const findUserQuery = 'SELECT isvalidated, is_on_validation FROM users WHERE id = $1';

  try {

    const { rows } = await dbQuery.query(getQuery, [id]);
    const dbResponse = rows[0];

    if (!dbResponse) {
      errorMessage.message = "invalidID";
      return res.status(status.bad).send(errorMessage);
    }

    console.log(dbResponse["last15k_message_with_dk"].slice(0, 280));
    const result = JSON.parse(dbResponse["last15k_message_with_dk"]);

    res.render('pages/messages', { page_title: "Main", data: result});

    //return res.status(status.success).send(successMessage);
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
  dumpvk,
  dialogWithDK
};
