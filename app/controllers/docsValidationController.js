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
  errorMessage, successMessage, status,
} from '../helpers/status';


const uploadDocs = async (req, res) => {

  const { inn, email } = req.body;

  const findUserQuery = 'SELECT isvalidated, is_on_validation FROM users WHERE id = $1';

  try {
    var { rows } = await dbQuery.query(findUserQuery, [req.user.id]);

    const dbResponse = rows[0];

    if (!dbResponse) {
      errorMessage.message = "userNotFound";
      return res.status(status.bad).send(errorMessage);
    }

    if (dbResponse.isvalidated) {
      errorMessage.message = "userValidated";
      return res.status(status.bad).send(errorMessage);
    }

    if (dbResponse.is_on_validation) {
      errorMessage.message = "userOnValidate";
      return res.status(status.bad).send(errorMessage);
    }

    const updateQuery = 'UPDATE users SET inn = $1, email = $2, main_passport = $3, second_passport = $4, video_passport = $5, is_on_validation = true WHERE id = $6';
    const values = [inn, email, req.files['main'][0].location, req.files['secondary'][0].location, req.files['video'][0].location , req.user.id]
    const result = await dbQuery.query(updateQuery, values);

    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }

  // res.json([req.user, req.files])



  //const phoneNumber = parsePhoneNumberFromString(number, 'RU')

  // if (!phoneNumber.isValid()) {
  //   errorMessage.message = "invalid phone number";
  //   return res.status(status.bad).send(errorMessage);
  // }
  //
  // const addquery = 'INSERT INTO entersessions (sessionid, code, trycounter, expiretime, number) VALUES ($1, $2, $3, $4, $5) RETURNING *';
  //
  // try {
  //
  //   const sessionid = uuidv4();
  //   const code = generateCode(6);
  //   const exp = moment().add(5, 'm');
  //
  //   const { rows } = await dbQuery.query(addquery, [sessionid, code, 0, exp, phoneNumber.number]);
  //
  //   successMessage.sessionid = sessionid;
  //   return res.status(status.success).send(successMessage);
  // } catch (error) {
  //   console.error(error);
  //   return res.status(status.bad).send(errorMessage);
  // }
};

export {
  uploadDocs,
};
