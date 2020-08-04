import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import dbQuery from '../db/dbQuery';

import {
  hashPassword,
  isValidEmail,
  isValidINN,
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

import env from '../../env';

const uploadDocs = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const { email } = req.body;
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

    const updateQuery = 'UPDATE users SET email = $1, main_passport = $2, second_passport = $3, video_passport = $4, is_on_validation = true, validation_type = $5 WHERE id = $6';
    const values = [email, req.files['main'][0].location, req.files['secondary'][0].location, req.files['video'][0].location, 'phiz', req.user.id]
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
  const email = req.query.email;


  if (isValidINN(inn) && isValidEmail(email)) {

    const checkHowMuch = 'SELECT * FROM bills WHERE creator_id = $1';
    const checkExist = 'SELECT * FROM bills WHERE inn = $1';
    const createBill = 'insert into bills(inn, link, expire, creator_id, invoiceNumber) VALUES ($1, $2, $3, $4, $5)'

    try {

      var { rows } = await dbQuery.query(checkExist, [inn]);
      const dbResponse = rows[0];

      if (dbResponse) {
        return res.status(status.success).redirect(dbResponse.link);
      }

      var checkHowMuchQuery = await dbQuery.query(checkHowMuch, [req.user.id]);
      if (checkHowMuchQuery.rows.length > 2) {
        return res.status(status.success).render('pages/static/errorPage', {Message: 'Слишком много запросов'});
      }

      if (!dbResponse || moment(dbResponse.expire).isAfter(moment())) {

        const getInvoice = "Select nextval(pg_get_serial_sequence('bills', 'id'))";
        const invoiceNumberQuery = await dbQuery.query(getInvoice, []);
        const invoiceNumber = invoiceNumberQuery.rows[0].nextval;

        const Dadata = require('dadata-suggestions');
        const dadata = new Dadata(env.dadata_apiKey);

        dadata.party({ query: inn, count: 1 })
        .then((data) => {
            console.log(data);
            if (data.suggestions[0]) {

              var request = require('request');

              const expire = moment().add(5, 'd');

              var myJSONObject = {
              "invoiceNumber": invoiceNumber,
              "dueDate": expire.format("YYYY-MM-DD"),
              "payer": {
                "name": data.suggestions[0].value,
                "inn": inn
              },
              "items": [
                {
                  "name": "Регистрация " + data.suggestions[0].value + " на сервисе Yousters Subscribe",
                  "price": 1,
                  "unit": "Шт",
                  "vat": "None",
                  "amount": 1
                }
              ],
              "contacts": [
                {
                  "email": email
                }
              ]
            };
            console.log(myJSONObject);
              request({
                  url: "https://business.tinkoff.ru/openapi/api/v1/invoice/send",
                  method: "POST",
                  headers: {
                    'Authorization': "Bearer " + env.tnkf_openAPI_id,
                    'Content-Type': 'application/json'
                  },
                  json: true,   // <--Very important!!!
                  body: myJSONObject
              }, function (error, response, body){
                console.log(body);
                if (body.pdfUrl) {
                  const values = [inn, body.pdfUrl, expire, req.user.id, invoiceNumber];
                  dbQuery.query(createBill, values);
                  return res.redirect(body.pdfUrl);
                } else {
                  return res.status(status.success).render('pages/static/errorPage', {Message: 'Неизвестная ошибка'});
                }
              });


            } else {
              return res.status(status.success).render('pages/static/errorPage', {Message: 'Поиск по ИНН не дал результатов'});
            }
        })
        .catch((error) => {
          console.error(error);
          return res.status(status.bad).send(errorMessage);
        })
      };
      //return res.status(status.success).send(successMessage);
    } catch (error) {
      console.error(error);
      return res.status(status.bad).send(errorMessage);
    }

  } else {
    console.error("invalid inn or email");
    return res.status(status.success).render('pages/static/errorPage', {Message: 'Некоректный ИНН и Email'});
  }

};

export {
  uploadDocs,
  uploadNonPhizData,
  renderBill
};
