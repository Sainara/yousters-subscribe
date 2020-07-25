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

const uploadDocs = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

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

    const updateQuery = 'UPDATE users SET inn = $1, email = $2, main_passport = $3, second_passport = $4, video_passport = $5, is_on_validation = true, validation_type = $6 WHERE id = $7';
    const values = [inn, email, req.files['main'][0].location, req.files['secondary'][0].location, req.files['video'][0].location, 'phiz', req.user.id]
    const result = await dbQuery.query(updateQuery, values);

    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

const uploadNonPhizData = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

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

    const updateQuery = 'UPDATE users SET inn = $1, email = $2, is_on_validation = true, validation_type = $3 WHERE id = $4';
    const values = [inn, email, 'nonPhiz', req.user.id]
    const result = await dbQuery.query(updateQuery, values);

    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

const renderBill = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const inn = req.query.inn;

  var re = new RegExp("^(\d{12})$");

  if (re.test(term)) {

    const checkHowMuch = 'SELECT * FROM bills WHERE creator_id = $1';
    const checkExist = 'SELECT * FROM bills WHERE inn = $1';
    const createBill = 'insert into bills(inn, link, expire, creator_id) VALUES ($1, $2, $3)'

    try {
      var { rows } = await dbQuery.query(checkExist, [inn]);
      const dbResponse = rows[0];

      if (!dbResponse) {

        const Dadata = require('dadata-suggestions');
        const dadata = new Dadata(env.dadata_apiKey);
        dadata.party({ query: inn, count: 1 })
        .then((data) => {
            console.log(data.suggestions[0].value);

            // const values = [inn, , req.user.id]
            // const create = await dbQuery.query(createBill, values)
        })
        .catch(error) {
          console.error(error);
          return res.status(status.bad).send(errorMessage);
        };
      }


      return res.status(status.success).send(successMessage);
    } catch (error) {
      console.error(error);
      return res.status(status.bad).send(errorMessage);
    }



  } else {
    console.error("invalid inn");
    errorMessage.message = "invalidINN";
    return res.status(status.bad).send(errorMessage);
  }

};

export {
  uploadDocs,
  uploadNonPhizData,
  renderBill
};
