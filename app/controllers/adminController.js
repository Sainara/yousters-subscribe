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
  errorMessage, successMessage, status,
} from '../helpers/status';

import {s3delete} from '../helpers/s3';


const listOfUsers = async (req, res) => {

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

const deleteUser = async (req, res) => {

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

    //return res.send(dbResponse)

    // const results = {
    //   'user': dbResponse,
    //  };
    // res.render('pages/person/user', results);

    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

export {
  listOfUsers,
  concretUser,
  deleteUser
};
