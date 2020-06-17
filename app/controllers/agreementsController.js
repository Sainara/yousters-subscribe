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

const getAgreements = async (req, res) => {

  const getQuery = 'SELECT * FROM agreements where creator_id = $1 ';

  try {

    //var hash = await generateFileHash(req.file.location);
    //console.log(hash);
    //var values = [title, hash, req.file.location, moment(), req.user.id]
    var { rows } = await dbQuery.query(getQuery, [req.user.id]);
    // const dbResponse = rows[0];
    //
    // if (!dbResponse) {
    //   errorMessage.message = "userNotFound";
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
    // const updateQuery = 'UPDATE users SET inn = $1, email = $2, main_passport = $3, second_passport = $4, video_passport = $5, is_on_validation = true WHERE id = $6';
    // const values = [inn, email, req.files['main'][0].location, req.files['secondary'][0].location, req.files['video'][0].location , req.user.id]
    // const result = await dbQuery.query(updateQuery, values);
    //
    successMessage.data = rows
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

    //var hash = await generateFileHash(req.file.location);
    //console.log(hash);
    //var values = [title, hash, req.file.location, moment(), req.user.id]
    var { rows } = await dbQuery.query(getQuery, [uid]);
    // const dbResponse = rows[0];
    //
    // if (!dbResponse) {
    //   errorMessage.message = "userNotFound";
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
    // const updateQuery = 'UPDATE users SET inn = $1, email = $2, main_passport = $3, second_passport = $4, video_passport = $5, is_on_validation = true WHERE id = $6';
    // const values = [inn, email, req.files['main'][0].location, req.files['secondary'][0].location, req.files['video'][0].location , req.user.id]
    // const result = await dbQuery.query(updateQuery, values);
    //
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
    //console.log(hash);
    var values = [title, hash, req.file.location, moment(), req.user.id, uuidv4()]
    var { rows } = await dbQuery.query(createQuery, values);
    // const dbResponse = rows[0];
    //
    // if (!dbResponse) {
    //   errorMessage.message = "userNotFound";
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
    // const updateQuery = 'UPDATE users SET inn = $1, email = $2, main_passport = $3, second_passport = $4, video_passport = $5, is_on_validation = true WHERE id = $6';
    // const values = [inn, email, req.files['main'][0].location, req.files['secondary'][0].location, req.files['video'][0].location , req.user.id]
    // const result = await dbQuery.query(updateQuery, values);
    //

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
};
