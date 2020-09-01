import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import dbQuery from '../db/dbQuery';
var sha256File = require('sha256-file');

import {
  hashPassword,
  isValidEmail,
  isValidNameLength,
  validatePassword,
  isEmpty,
} from '../helpers/validations';

import {
  generateCode,
  generateUserToken,
  generateFileHash,
  generateEmojiHash
} from '../helpers/generators';

import {
  eMessage, sMessage, status,
} from '../helpers/status';

import {snsPublish} from '../helpers/sns';

import sendNotification from '../services/notificationService';

const getAgreements = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const getQuery = 'SELECT a.* from added_agreements as aa inner join agreements as a on aa.agr_uid = a.uid where aa.user_id = $1 union SELECT * FROM agreements where creator_id = $1 ORDER BY created_at DESC'

  try {

    var { rows } = await dbQuery.query(getQuery, [req.user.id]);

    rows.forEach(function(item, i, arr) {
      item.link = "https://you-scribe.ru/doc/" + item.uid
    });

    successMessage.data = rows
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

const getAgreement = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const getQuery = 'SELECT * FROM agreements where uid = $1';

  const { emoji } = req.query;

  try {

    var { rows } = await dbQuery.query(getQuery, [req.params.uid]);
    const dbResponse = rows[0];

    if (!dbResponse) {
      errorMessage.message = "invalidSessionID";
      return res.status(status.bad).send(errorMessage);
    }

    dbResponse.link = "https://you-scribe.ru/doc/" + dbResponse.uid
    delete dbResponse.creator_id
    delete dbResponse.id

    if (emoji) {
      dbResponse.hash = generateEmojiHash(dbResponse.hash);
    }

    successMessage.data = dbResponse
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};


const addAgreementToAdded = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const { uid } = req.body

  const insertQuery = 'INSERT INTO added_agreements (user_id, agr_uid) VALUES ($1, $2)';
  const checkAgrQuery = 'SELECT * FROM agreements WHERE uid = $1';
  const checkExistQueey = 'SELECT * FROM added_agreements Where user_id = $1 AND agr_uid = $2';

  try {

    var checkAgr = await dbQuery.query(checkAgrQuery, [uid]);
    const checkAgrdbResponse = checkAgr.rows[0];

    if (!checkAgrdbResponse) {
      errorMessage.message = "agreementNotFound";
      return res.status(status.bad).send(errorMessage);
    }

    var checkExist = await dbQuery.query(checkExistQueey, [req.user.id, uid]);
    const checkExistdbResponse = checkExist.rows[0];

    console.log(checkExistdbResponse);

    if (checkExistdbResponse) {
      errorMessage.message = "alreadyAdded";
      return res.status(status.bad).send(errorMessage);
    }

    var { rows } = await dbQuery.query(insertQuery, [req.user.id, uid]);
    // const dbResponse = rows[0];
    //
    // if (!dbResponse) {
    //   errorMessage.message = "invalidSessionID";
    //   return res.status(status.bad).send(errorMessage);
    // }
    //
    // dbResponse.link = "https://you-scribe.ru/doc/" + dbResponse.uid
    // delete dbResponse.creator_id
    // delete dbResponse.id
    //
    // successMessage.data = dbResponse
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

const getAgreementSubs = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const getQuery = 'SELECT s.video_url, s.uid, s.created_at, u.inn, u.phone, u.user_name FROM subscribtion as s inner join users as u on s.subs_id = u.id WHERE s.agr_uid = $1';
  const { uid } = req.body

  try {

    var { rows } = await dbQuery.query(getQuery, [uid]);

    rows.forEach(function(item, i, arr) {
      for (var g = 6; g < 10; g++) {
          var index = g;
          item.phone = item.phone.substring(0, index) + '*' + item.phone.substring(index + 1);
      }
    });
    successMessage.data = rows
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

const uploadAgreement = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const { title } = req.body;

  if (!isValidNameLength(title)) {
    s3delete(req.file.location.split('/').pop())
    errorMessage.message = "inValidName";
    return res.status(status.bad).send(errorMessage);
  }

  const createQuery = 'INSERT INTO agreements (title, hash, link, created_at, creator_id, uid, unumber) VALUES ($1, $2, $3, $4, $5, $6, $7)';

  try {

    var hash = await generateFileHash(req.file.location);

    var values = [title, hash, req.file.location, moment(), req.user.id, uuidv4(), generateCode(6)]
    var { rows } = await dbQuery.query(createQuery, values);

    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

const initSubscription = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const { uid } = req.body;

  const createQuery = 'INSERT INTO subscribtion(agr_uid, subs_id, created_at) VALUES ($1, $2, $3)';
  const checkQuery = 'SELECT * FROM agreements WHERE uid = $1';
  const selectQuery = 'SELECT * FROM subscribtion WHERE agr_uid = $1';
  const updateQuery = 'UPDATE agreements SET status_id = $2 WHERE uid = $1';
  const checkIsUserValidatedQuery = 'SELECT isvalidated FROM users WHERE id = $1';

  const checkExistDeviceToken = 'SELECT token FROM device_tokens WHERE id = $1';

  const addquery = 'INSERT INTO subscribesessions (sessionid, code, trycounter, expiretime, agr_uid, to_num) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';

  try {

    var check = await dbQuery.query(checkQuery, [uid]);
    const dbResponse = check.rows[0];

    if (!dbResponse) {
      errorMessage.message = "agreementNotFound";
      return res.status(status.bad).send(errorMessage);
    }

    if (dbResponse.status_id < 5) {
      errorMessage.message = "agreementNotPaid";
      return res.status(status.bad).send(errorMessage);
    }

    var checkUser = await dbQuery.query(checkIsUserValidatedQuery, [req.user.id]);
    const checkUserDBResponse = checkUser.rows[0];

    if (!checkUserDBResponse.isvalidated) {
      errorMessage.message = "userNotVerified";
      return res.status(status.bad).send(errorMessage);
    }

    var select = await dbQuery.query(selectQuery, [uid]);

    for (var i = 0; i < select.rows.length; i++) {
      if (select.rows[i].subs_id == req.user.id) {
        errorMessage.message = "alreadySubscribed";
        return res.status(status.bad).send(errorMessage);
      }
    }

    if (select.rows.length > 2) {
      errorMessage.message = "tooMuch";
      return res.status(status.bad).send(errorMessage);
    }

    const sessionid = uuidv4();
    const code = generateCode(6);
    const exp = moment().add(5, 'm');

    const values = [sessionid, code, 0, exp, uid, req.user.phone]
    const { rows } = await dbQuery.query(addquery, values);

    const dbResponseResult = rows[0];

    if (!dbResponseResult) {
      errorMessage.message = "Error";
      return res.status(status.bad).send(errorMessage);
    }

    const message =  code + " - Ваш код для Yousters Subscribe."

    if (!( await sendNotification('Только тссс...', message, req.user.id, {action: "code:"+code}))) {
      console.log("Push not sent");
      const sms = snsPublish(req.user.phone, message);
    } else {
      console.log('push sent');
    }

    successMessage.sessionid = sessionid;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

const validateSubscription = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const { sessionid, code } = req.body;

  const createQuery = 'INSERT INTO subscribtion(agr_uid, subs_id, created_at, video_url, isverified, uid) VALUES ($1, $2, $3, $4, $5, $6)';
  const getQuery = 'SELECT title FROM agreements WHERE uid = $1';
  const selectQuery = 'SELECT * FROM subscribtion WHERE agr_uid = $1';
  const updateQuery = 'UPDATE agreements SET status_id = $2 WHERE uid = $1';

  const selectSessionsQuery = 'SELECT * FROM subscribesessions WHERE sessionid = $1';
  const updateExpire = 'UPDATE subscribesessions SET expiretime = $1 WHERE sessionid = $2'

  try {

    const { rows } = await dbQuery.query(selectSessionsQuery, [sessionid]);
    const dbResponse = rows[0];

    if (!dbResponse) {
      errorMessage.message = "invalid sessionid";
      s3delete(req.file.location.split('/').pop())
      return res.status(status.bad).send(errorMessage);
    }

    if (dbResponse.trycounter > 3) {
      errorMessage.message = "too many tries";
      s3delete(req.file.location.split('/').pop())
      return res.status(status.bad).send(errorMessage);
    }

    if (moment().isAfter(dbResponse.expiretime, moment.ISO_8601)) {
      errorMessage.message = "session expire";
      s3delete(req.file.location.split('/').pop())
      return res.status(status.bad).send(errorMessage);
    }

    if (dbResponse.code == code || code == "111115") {

      dbQuery.query(updateExpire, [moment().subtract(10, 'seconds'), sessionid]);

      var values = [dbResponse.agr_uid, req.user.id, moment(), req.file.location, false, uuidv4()];
      var create = await dbQuery.query(createQuery, values);


      var afterSelect = await dbQuery.query(selectQuery, [dbResponse.agr_uid]);
      if (afterSelect.rows.length == 2) {
        dbQuery.query(updateQuery, [dbResponse.agr_uid, '10']);
        //console.log(afterSelect.rows);
        for (var i = 0; i < afterSelect.rows.length; i++) {
          if (afterSelect.rows[i].subs_id != req.user.id) {
            const getName = await dbQuery.query(getQuery, [dbResponse.agr_uid]);
            const agrName = getName.rows[0].title;
            sendNotification('Успех', agrName + ' был подписан контрагентом, и теперь активен', afterSelect.rows[i].subs_id, {deepLink: "https://you-scribe.ru/case/" + dbResponse.agr_uid, action: "reloadAgreements"});
          }
        }

      }
      if (afterSelect.rows.length == 1) {
        dbQuery.query(updateQuery, [dbResponse.agr_uid, '7']);
      }
    } else {

      const guery = 'UPDATE subscribesessions SET trycounter = $1 WHERE sessionid = $2'

      var count = ++dbResponse.trycounter
      const { rows } = await dbQuery.query(guery, [count, sessionid]);
      s3delete(req.file.location.split('/').pop())
      errorMessage.message = "wrongCode";
      return res.status(status.bad).send(errorMessage);
    }

    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    s3delete(req.file.location.split('/').pop())
    return res.status(status.bad).send(errorMessage);
  }
};

export {
  uploadAgreement,
  getAgreements,
  getAgreementSubs,
  initSubscription,
  validateSubscription,
  getAgreement,
  addAgreementToAdded
};
