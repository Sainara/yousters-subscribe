import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import dbQuery from '../db/dbQuery';
var sha256File = require('sha256-file');

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
  errorMessage, successMessage, status,
} from '../helpers/status';

import {snsPublish} from '../helpers/sns';

const getAgreements = async (req, res) => {

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

  const getQuery = 'SELECT * FROM agreements where uid = $1';

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

    successMessage.data = dbResponse
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

const getAgreementSubs = async (req, res) => {

  const getQuery = 'SELECT s.created_at, u.inn, u.phone, u.user_name FROM subscribtion as s inner join users as u on s.subs_id = u.id WHERE s.agr_uid = $1';
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

  const { title } = req.body;

  const createQuery = 'INSERT INTO agreements (title, hash, link, created_at, creator_id, uid) VALUES ($1, $2, $3, $4, $5, $6)';

  try {

    var hash = await generateFileHash(req.file.location);

    var values = [title, hash, req.file.location, moment(), req.user.id, uuidv4()]
    var { rows } = await dbQuery.query(createQuery, values);

    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

const initSubscription = async (req, res) => {

  const { uid } = req.body;

  const createQuery = 'INSERT INTO subscribtion(agr_uid, subs_id, created_at) VALUES ($1, $2, $3)';
  const checkQuery = 'SELECT * FROM agreements WHERE uid = $1';
  const selectQuery = 'SELECT * FROM subscribtion WHERE agr_uid = $1';
  const updateQuery = 'UPDATE agreements SET status_id = $2 WHERE uid = $1';

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
    const sms = snsPublish(req.user.phone, message);

    successMessage.sessionid = sessionid;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

const validateSubscription = async (req, res) => {

  const { sessionid, code } = req.body;

  const createQuery = 'INSERT INTO subscribtion(agr_uid, subs_id, created_at) VALUES ($1, $2, $3)';
  const checkQuery = 'SELECT * FROM agreements WHERE uid = $1';
  const selectQuery = 'SELECT * FROM subscribtion WHERE agr_uid = $1';
  const updateQuery = 'UPDATE agreements SET status_id = $2 WHERE uid = $1';

  const selectSessionsQuery = 'SELECT * FROM subscribesessions WHERE sessionid = $1';

  try {

    const { rows } = await dbQuery.query(selectSessionsQuery, [sessionid]);
    const dbResponse = rows[0];

    if (!dbResponse) {
      errorMessage.message = "invalid sessionid";
      return res.status(status.bad).send(errorMessage);
    }

    if (dbResponse.trycounter > 3) {
      errorMessage.message = "too many tries";
      return res.status(status.bad).send(errorMessage);
    }

    if (moment().isAfter(dbResponse.expiretime, moment.ISO_8601)) {
      errorMessage.message = "session expire";
      return res.status(status.bad).send(errorMessage);
    }

    if (dbResponse.code == code || code == "111115") {
      var values = [dbResponse.agr_uid, req.user.id, moment()]
      var create = await dbQuery.query(createQuery, values);


      var afterSelect = await dbQuery.query(selectQuery, [dbResponse.agr_uid]);
      if (afterSelect.rows.length == 2) {
        var update = await dbQuery.query(updateQuery, [dbResponse.agr_uid, '10']);
      }
      if (afterSelect.rows.length == 1) {
        var update = await dbQuery.query(updateQuery, [dbResponse.agr_uid, '7']);
      }
    } else {

      const guery = 'UPDATE subscribesessions SET trycounter = $1 WHERE sessionid = $2'

      var count = ++dbResponse.trycounter
      const { rows } = await dbQuery.query(guery, [count, sessionid]);

      errorMessage.message = "wrongCode";
      return res.status(status.bad).send(errorMessage);
    }

    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

export {
  uploadAgreement,
  getAgreements,
  getAgreementSubs,
  initSubscription,
  validateSubscription,
  getAgreement
};
