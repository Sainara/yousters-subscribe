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
  generateCode,
  generateUserToken,
  generateFileHash,
} from '../helpers/generators';

import {
  eMessage, sMessage, status,
} from '../helpers/status';

import {s3delete} from '../helpers/s3';

import sendNotification from '../services/notificationService';


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

export {
  listOfUsers,
  concretUser,
  validateUser,
  deleteUser,
  deleteAgreement,
  activatePhiz
};
