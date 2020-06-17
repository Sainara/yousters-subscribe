import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import dbQuery from '../db/dbQuery';

import {
  hashPassword,
  isValidEmail,
  validatePassword,
  isEmpty,
  generateCode,
  generateUserToken,
} from '../helpers/validations';

// import {
//   generateCode,
//   generateUserToken,
//   generateFileHash,
// } from '../helpers/generators';

import {
  errorMessage, successMessage, status,
} from '../helpers/status';


const auth = async (req, res) => {

  const { number } = req.body;

  const phoneNumber = parsePhoneNumberFromString(number, 'RU')

  if (!phoneNumber.isValid()) {
    errorMessage.message = "invalid phone number";
    return res.status(status.bad).send(errorMessage);
  }

  const addquery = 'INSERT INTO entersessions (sessionid, code, trycounter, expiretime, number) VALUES ($1, $2, $3, $4, $5) RETURNING *';
  const checkquery = 'SELECT * FROM blacklist WHERE phone = $1'

  try {

    const check = await dbQuery.query(checkquery, [phoneNumber.number]);
    if (check.rows[0]) {
      errorMessage.message = "number blocked";
      return res.status(status.conflict).send(errorMessage);
    }

    const sessionid = uuidv4();
    const code = generateCode(6);
    const exp = moment().add(5, 'm');

    const { rows } = await dbQuery.query(addquery, [sessionid, code, 0, exp, phoneNumber.number]);

    successMessage.sessionid = sessionid;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

const validate = async (req, res) => {

  const { sessionid, code } = req.body;

  const getQuery = 'SELECT * FROM entersessions WHERE sessionid = $1';

  try {

    const { rows } = await dbQuery.query(getQuery, [sessionid]);
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
    if (dbResponse.code == code) {
      const findUserQuery = 'SELECT id, phone, isvalidated, is_on_validation, user_name, inn, email FROM users WHERE phone = $1';
      //console.log(dbResponse.number);
      const { rows } = await dbQuery.query(findUserQuery, [dbResponse.number]);
      //console.log(rows);
      const dbResponse2 = rows[0];

      if (!dbResponse2) {
        const createUserQuery = `INSERT INTO
               users(phone, created_on)
               VALUES($1, $2)
               returning id, phone, isvalidated, is_on_validation`;

        const values = [
           dbResponse.number, moment(),
                 ];
        //console.log(values);
        const { rows } = await dbQuery.query(createUserQuery, values);
        const dbResponse3 = rows[0];

        const token = generateUserToken(dbResponse3.id, dbResponse3.phone, dbResponse3.isvalidated);
        delete dbResponse3.id
        successMessage.data = dbResponse3;
        successMessage.token = token;

        return res.status(status.success).send(successMessage);
      } else {
        //console.log("!!!!!");
        const token = generateUserToken(dbResponse2.id, dbResponse2.phone, dbResponse2.isvalidated);
        delete dbResponse2.id
        successMessage.data = dbResponse2;
        successMessage.token = token;
        return res.status(status.success).send(successMessage);
      }

    } else {

      const guery = 'UPDATE entersessions SET trycounter = $1 WHERE sessionid = $2'

      var count = ++dbResponse.trycounter
      //console.log(count);
      const { rows } = await dbQuery.query(guery, [count, sessionid]);

      errorMessage.message = "wrong code";
      return res.status(status.bad).send(errorMessage);
    }


    //return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.conflict).send(errorMessage);
  }
};

const me = async (req, res) => {

  const getQuery = 'SELECT phone, isvalidated, is_on_validation, user_name, inn, email FROM users WHERE id = $1';

  try {

    const { rows } = await dbQuery.query(getQuery, [req.user.id]);
    const dbResponse = rows[0];

    if (!dbResponse) {
      errorMessage.message = "userNotFound";
      return res.status(status.bad).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};
// /**
//    * Create A Admin
//    * @param {object} req
//    * @param {object} res
//    * @returns {object} reflection object
//    */
// const createAdmin = async (req, res) => {
//   const {
//     email, first_name, last_name, password,
//   } = req.body;
//
//   const { is_admin } = req.user;
//
//   const isAdmin = true;
//   const created_on = moment(new Date());
//
//   if (!is_admin === false) {
//     errorMessage.error = 'Sorry You are unauthorized to create an admin';
//     return res.status(status.bad).send(errorMessage);
//   }
//
//   if (isEmpty(email) || isEmpty(first_name) || isEmpty(last_name) || isEmpty(password)) {
//     errorMessage.error = 'Email, password, first name and last name field cannot be empty';
//     return res.status(status.bad).send(errorMessage);
//   }
//   if (!isValidEmail(email)) {
//     errorMessage.error = 'Please enter a valid Email';
//     return res.status(status.bad).send(errorMessage);
//   }
//   if (!validatePassword(password)) {
//     errorMessage.error = 'Password must be more than five(5) characters';
//     return res.status(status.bad).send(errorMessage);
//   }
//   const hashedPassword = hashPassword(password);
//   const createUserQuery = `INSERT INTO
//       users(email, first_name, last_name, password, is_admin, created_on)
//       VALUES($1, $2, $3, $4, $5, $6)
//       returning *`;
//   const values = [
//     email,
//     first_name,
//     last_name,
//     hashedPassword,
//     isAdmin,
//     created_on,
//   ];
//
//   try {
//     const { rows } = await dbQuery.query(createUserQuery, values);
//     const dbResponse = rows[0];
//     delete dbResponse.password;
//     const token = generateUserToken(dbResponse.email, dbResponse.id, dbResponse.is_admin, dbResponse.first_name, dbResponse.last_name);
//     successMessage.data = dbResponse;
//     successMessage.data.token = token;
//     return res.status(status.created).send(successMessage);
//   } catch (error) {
//     if (error.routine === '_bt_check_unique') {
//       errorMessage.error = 'Admin with that EMAIL already exist';
//       return res.status(status.conflict).send(errorMessage);
//     }
//   }
// };
//
// /**
//  * Update A User to Admin
//  * @param {object} req
//  * @param {object} res
//  * @returns {object} updated user
//  */
// const updateUserToAdmin = async (req, res) => {
//   const { id } = req.params;
//   const { isAdmin } = req.body;
//
//   const { is_admin } = req.user;
//   if (!is_admin === true) {
//     errorMessage.error = 'Sorry You are unauthorized to make a user an admin';
//     return res.status(status.bad).send(errorMessage);
//   }
//   if (isAdmin === '') {
//     errorMessage.error = 'Admin Status is needed';
//     return res.status(status.bad).send(errorMessage);
//   }
//   const findUserQuery = 'SELECT * FROM users WHERE id=$1';
//   const updateUser = `UPDATE users
//         SET is_admin=$1 WHERE id=$2 returning *`;
//   try {
//     const { rows } = await dbQuery.query(findUserQuery, [id]);
//     const dbResponse = rows[0];
//     if (!dbResponse) {
//       errorMessage.error = 'User Cannot be found';
//       return res.status(status.notfound).send(errorMessage);
//     }
//     const values = [
//       isAdmin,
//       id,
//     ];
//     const response = await dbQuery.query(updateUser, values);
//     const dbResult = response.rows[0];
//     delete dbResult.password;
//     successMessage.data = dbResult;
//     return res.status(status.success).send(successMessage);
//   } catch (error) {
//     errorMessage.error = 'Operation was not successful';
//     return res.status(status.error).send(errorMessage);
//   }
// };

export {
  auth,
  validate,
  me
};