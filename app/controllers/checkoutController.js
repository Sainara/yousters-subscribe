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
  isAgreementExist
} from '../helpers/checkers';

import {
  eMessage, sMessage, status,
} from '../helpers/status';

import env from '../../env';

var YandexCheckout = require('yandex-checkout')(env.yandexCheckoutShopId, env.yandexCheckoutSecretKey);

const createPayment = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const { agr_uid } = req.body;

  const checkExistQuery = 'SELECT uid, status FROM payments WHERE agr_uid = $1';
  const createQuery = 'INSERT INTO payments (uid, user_id, agr_uid, amount, created_at) VALUES ($1, $2, $3, $4, $5) returning uid';

  try {
    if (!await isAgreementExist(agr_uid)) {
      errorMessage.message = "agreementNotFound";
      return res.status(status.bad).send(errorMessage);
    }

    var check = await dbQuery.query(checkExistQuery, [agr_uid]);
    const dbResponse = check.rows[check.rows.length - 1];

    if (dbResponse) {
      if (dbResponse.status != "failure") {
        successMessage.uid = dbResponse.uid;
        return res.status(status.success).send(successMessage);
      }
    }

    const values = [uuidv4(), req.user.id, agr_uid, '39.00', moment()];
    const {rows} = await dbQuery.query(createQuery, values);

    successMessage.uid = rows[0].uid;
    return res.status(status.success).send(successMessage);

  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

// const renderCheckout = async (req, res) => {
//
//   const errorMessage = Object.assign({}, eMessage);
//   const successMessage = Object.assign({}, sMessage);
//
//   const { uid } = req.params;
//
//   if (uid == "success") {
//     return res.status(status.success);
//   }
//
//   if (uid == "failure") {
//     return res.status(status.success).send('<h1>Оплата не прошла</h1>');
//   }
//
//   const getPaymentQuery = 'SELECT * FROM payments WHERE uid = $1';
//   const getUserData = 'SELECT phone, inn, email FROM users WHERE id = $1';
//   const updatePaymentQuery = 'UPDATE payments SET yndx_id = $1 WHERE uid = $2';
//   const updatePaymentStatusQuery = 'UPDATE payments SET status = $1 WHERE uid = $2';
//   const updateAgreementQuery = 'UPDATE agreements set status_id = 5 WHERE uid = $1';
//
//   try {
//
//     const {rows} = await dbQuery.query(getPaymentQuery, [uid]);
//     const dbResponse = rows[0];
//
//     if (!dbResponse) {
//       errorMessage.message = "invalidID";
//       return res.status(status.bad).send(errorMessage);
//     }
//
//     const rawUserData = await dbQuery.query(getUserData, [dbResponse.user_id]);
//     const userData = rawUserData.rows[0];
//
//     var idempotenceKey = uid;
//     YandexCheckout.createPayment({
//       'amount': {
//         'value': dbResponse.amount,
//         'currency': 'RUB'
//       },
//       'confirmation': {
//         'type': 'embedded'
//       },
//       'capture': true,
//       'description': uid,
//       "receipt": {
//           "type": "payment",
//           "send": "true",
//           "customer": {
//             "phone": userData.phone.substring(1),
//             'inn': userData.inn,
//             'email' : userData.email
//           },
//           "items": [
//             {
//               "description": "Разовое подписание",
//               "quantity": "1.00",
//               "amount": {
//                 "value": dbResponse.amount,
//                 "currency": "RUB"
//               },
//               "vat_code": "1",
//             }
//           ],
//           "settlements": [
//           ]
//         }
//     }, idempotenceKey)
//       .then(function(payment) {
//         console.log({payment: payment});
//
//         if (payment.status != "pending") {
//           if (payment.paid) {
//             dbQuery.query(updatePaymentStatusQuery, ['success', dbResponse.uid]);
//             dbQuery.query(updateAgreementQuery, [dbResponse.agr_uid]);
//             return res.redirect('https://you-scribe.ru/api/v1/checkout/success');
//           } else {
//             dbQuery.query(updatePaymentStatusQuery, ['failure', dbResponse.uid]);
//             return res.redirect('https://you-scribe.ru/api/v1/checkout/failure');
//           }
//           return res.status(status.success).send(successMessage);
//         }
//
//         var return_url = "https://you-scribe.ru/api/v1/checkout/" + uid;
//         const result = {
//           confirmation_token: payment.confirmation.confirmation_token,
//           return_url: return_url,
//          };
//         res.render('pages/yandexCheckout', result);
//         dbQuery.query(updatePaymentQuery, [payment.id, dbResponse.uid]);
//       })
//       .catch(function(err) {
//         console.error(err);
//         res.status(status.bad).send(errorMessage);
//       })
//
//
//   } catch (error) {
//     console.error(error);
//     return res.status(status.bad).send(errorMessage);
//   }
// };

const renderCheckout = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const { uid } = req.params;

  const getPaymentQuery = 'SELECT * FROM payments WHERE uid = $1';
  const getUserData = 'SELECT phone, inn, email FROM users WHERE id = $1';
  const updatePaymentQuery = 'UPDATE payments SET yndx_id = $1 WHERE uid = $2';
  const updatePaymentStatusQuery = 'UPDATE payments SET status = $1 WHERE uid = $2';
  const updateAgreementQuery = 'UPDATE agreements set status_id = 5 WHERE uid = $1';

  try {

    if (uid == "success") {
      return res.status(status.success);
    }


      if (uid == "failure") {
        return res.status(status.success).send('<h1>Оплата не прошла</h1>');
      }

    const {rows} = await dbQuery.query(getPaymentQuery, [uid]);
    const dbResponse = rows[0];

    if (!dbResponse) {
      errorMessage.message = "invalidID";
      return res.status(status.bad).send(errorMessage);
    }

    const rawUserData = await dbQuery.query(getUserData, [dbResponse.user_id]);
    const userData = rawUserData.rows[0];

    var idempotenceKey = uid;

    var request = require('request');

    var myJSONObject = {
      "TerminalKey": env.tnkf_terminal_id,
      "Amount": 3900,
      "OrderId": uid,
      "Description": "Разовое подписание документа",
      "DATA": {
          "Phone": userData.phone,
          "Email": userData.email
      },
      "Receipt": {
          "Email": userData.email,
          "Phone": userData.phone,
          "EmailCompany": "info@you-scribe.ru",
          "Taxation": "usn_income",
          "Items": [
              {
                  "Name": "Разовое подписание",
                  "Price": 3900,
                  "Quantity": 1.00,
                  "Amount": 3900,
                  "PaymentMethod": "full_prepayment",
                  "PaymentObject": "service",
                  "Tax": "none"
              }
          ]
      }
  };
    request({
        url: "https://securepay.tinkoff.ru/v2/Init",
        method: "POST",
        json: true,   // <--Very important!!!
        body: myJSONObject
    }, function (error, response, body){
      console.log(body);
      if (body.Success) {
        console.log(body.PaymentId);
        console.log(body.PaymentURL);
        dbQuery.query(updatePaymentQuery, [body.PaymentId, dbResponse.uid]);
        return res.redirect(body.PaymentURL);
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

export {
  createPayment,
  renderCheckout
};
