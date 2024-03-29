import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import dbQuery from '../db/dbQuery';

var crypto = require('crypto');

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

const AppleReceiptVerify = require('node-apple-receipt-verify');

// Common initialization, later you can pass options for every request in options
AppleReceiptVerify.config({
  secret: env.iap_secret,
});

const checkPromoCode  = async (req, res) => {
  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const { promoCode } = req.body;

  const getPromoCodeQuery = 'SELECT * FROM promocodes WHERE value = $1';
  //  const getPaketIAPID = 'SELECT iap_id FROM paketplans WHERE id = $1';

  try {

    const {rows} = await dbQuery.query(getPromoCodeQuery, [promoCode]);

    const dbResponse = rows[0];

    if (!dbResponse) {
      errorMessage.message = "promoCodeNotFound";
      return res.status(status.bad).send(errorMessage);
    }

    if (!dbResponse.is_active) {
      errorMessage.message = "promoCodeNotActive";
      return res.status(status.bad).send(errorMessage);
    }

    return res.status(status.success).send(successMessage);

  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

const checkIAP  = async (req, res) => {
  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const { receiptID, orderID } = req.body;

  const getPaymentQuery = 'SELECT * FROM payments WHERE uid = $1';
  const getPaketIAPID = 'SELECT iap_id FROM paketplans WHERE id = $1';

  const updatePaymentQuery = 'UPDATE payments SET apple_iap_id = $1 WHERE uid = $2';
  const updatePaymentStatusQuery = 'UPDATE payments SET status = $1 WHERE uid = $2';
  const updateAgreementQuery = 'UPDATE agreements set status_id = 5 WHERE uid = $1';
  const addPaketInfo = 'INSERT INTO userpakets(paket_id, user_id, payment_uid) VALUES ($1, $2, $3)';

  try {

    const {rows} = await dbQuery.query(getPaymentQuery, [orderID]);
    const dbResponse = rows[0];

    if (!dbResponse) {
      errorMessage.message = "invalidPaymentID";
      return res.status(status.bad).send(errorMessage);
    }

    if (dbResponse.status == 'success') {
      errorMessage.message = "alreadyPaid";
      return res.status(status.bad).send(errorMessage);
    }

    var getPaketIAPIDdbResponse = "";

    if (dbResponse.paket_id) {
      const getPaketIAPIDResp = await dbQuery.query(getPaketIAPID, [dbResponse.paket_id]);
      getPaketIAPIDdbResponse = getPaketIAPIDResp.rows[0].iap_id;
    }

    console.log(getPaketIAPIDdbResponse);

    const products = await AppleReceiptVerify.validate({
      receipt: receiptID,
    });

    const product = products[0];
    console.log(product);
    // if (product.productId != getPaketIAPIDdbResponse) {
    //   errorMessage.message = "missmatchIAP";
    //   return res.status(status.bad).send(errorMessage);
    // }
    dbQuery.query(updatePaymentQuery, [product.transactionId, orderID]);
    dbQuery.query(updatePaymentStatusQuery, ['success', dbResponse.uid]);
    if (dbResponse.agr_uid) {
      dbQuery.query(updateAgreementQuery, [dbResponse.agr_uid]);
      return res.status(status.success).send(successMessage);
    };
    if (dbResponse.paket_id) {
      dbQuery.query(addPaketInfo, [dbResponse.paket_id, dbResponse.user_id, dbResponse.uid]);
      return res.status(status.success).send(successMessage);
    };

  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};


const createPayment = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const { type, promo_code } = req.body;

  if (!type) {
    errorMessage.message = "missingType";
    return res.status(status.bad).send(errorMessage);
  }

  if (type == 'agreement') {

    const { agr_uid } = req.body;

    const checkExistQuery = 'SELECT uid, status FROM payments WHERE agr_uid = $1';
    const createQuery = 'INSERT INTO payments (uid, user_id, agr_uid, amount, created_at, title, promocode) VALUES ($1, $2, $3, $4, $5, $6, $7) returning uid';

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

      const values = [uuidv4(), req.user.id, agr_uid, '75.00', moment(), 'Разовое подписание', promo_code];
      const {rows} = await dbQuery.query(createQuery, values);

      successMessage.uid = rows[0].uid;
      return res.status(status.success).send(successMessage);

    } catch (error) {
      console.error(error);
      return res.status(status.bad).send(errorMessage);
    }
  }

  if (type == 'paket') {
    const { paket_id } = req.body;

    const checkPaketQuery = 'SELECT * FROM paketplans WHERE iap_id = $1';
    const checkExistQuery = 'SELECT uid, status FROM payments WHERE paket_id = $1 AND user_id = $2';
    const createQuery = 'INSERT INTO payments (uid, user_id, paket_id, amount, created_at, title, promocode) VALUES ($1, $2, $3, $4, $5, $6, $7) returning uid';

    try {

      var checkPaket = await dbQuery.query(checkPaketQuery, [paket_id]);
      const checkPaketdbResponse = checkPaket.rows[0];

      if (!checkPaketdbResponse) {
        errorMessage.message = "paketNotFound";
        return res.status(status.bad).send(errorMessage);
      }

      var check = await dbQuery.query(checkExistQuery, [checkPaketdbResponse.id, req.user.id]);
      const dbResponse = check.rows[check.rows.length - 1];

      const values = [uuidv4(), req.user.id, checkPaketdbResponse.id, checkPaketdbResponse.price, moment(), checkPaketdbResponse.title, promo_code];
      const {rows} = await dbQuery.query(createQuery, values);

      successMessage.uid = rows[0].uid;
      return res.status(status.success).send(successMessage);

    } catch (error) {
      console.error(error);
      return res.status(status.bad).send(errorMessage);
    }
  }

  if (type == 'documentService') {
    const { offer_id } = req.body;

    const checkOfferQuery = 'SELECT * FROM offers WHERE uid = $1';
    // const checkExistQuery = 'SELECT uid, status FROM payments WHERE paket_id = $1 AND user_id = $2';
    const createQuery = 'INSERT INTO payments (uid, user_id, offer_id, amount, created_at, title, promocode) VALUES ($1, $2, $3, $4, $5, $6, $7) returning uid';

    try {

      var checkOffer = await dbQuery.query(checkOfferQuery, [offer_id]);
      const checkOfferdbResponse = checkOffer.rows[0];

      if (!checkOfferdbResponse) {
        errorMessage.message = "offerNotFound";
        return res.status(status.bad).send(errorMessage);
      }

      // var check = await dbQuery.query(checkExistQuery, [checkPaketdbResponse.id, req.user.id]);
      // const dbResponse = check.rows[check.rows.length - 1];

      var price = 0;
      var title = "";

      if (checkOfferdbResponse.status == 'created') {
        title = "Предоплата: " +  checkOfferdbResponse.title;
        price = parseInt(parseInt(checkOfferdbResponse.price)/5);
      } else {
        title = "Оплата оставшейся части: " +  checkOfferdbResponse.title;
        price = parseInt(checkOfferdbResponse.price) - parseInt(parseInt(checkOfferdbResponse.price)/5);
      }

      price = price + ".00";

      const values = [uuidv4(), req.user.id, checkOfferdbResponse.uid, price, moment(), title, promo_code];
      const {rows} = await dbQuery.query(createQuery, values);

      successMessage.uid = rows[0].uid;
      return res.status(status.success).send(successMessage);

    } catch (error) {
      console.error(error);
      return res.status(status.bad).send(errorMessage);
    }
  }

  errorMessage.message = "incorrectType";
  return res.status(status.bad).send(errorMessage);

};
//
// const renderCheckout = async (req, res) => {
//
//   const errorMessage = Object.assign({}, eMessage);
//   const successMessage = Object.assign({}, sMessage);
//
//   const { uid } = req.params;
//   const { source } = req.query;
//
//   if (uid == "success") {
//     return res.redirect('/general');
//   }
//
//   if (uid == "failure") {
//     var data = {};
//     data.Message = req.query.reason;
//     data.PaymentURL = "https://you-scribe.ru/general";
//     console.log(data);
//     return res.status(status.success).render('pages/static/paymentFailure', data);
//   }
//
//   const getPaymentQuery = 'SELECT * FROM payments WHERE uid = $1';
//   const getUserData = 'SELECT user_name, phone, inn, email FROM users WHERE id = $1';
//   const updatePaymentQuery = 'UPDATE payments SET yndx_id = $1 WHERE uid = $2';
//   const updatePaymentStatusQuery = 'UPDATE payments SET status = $1 WHERE uid = $2';
//   const updateAgreementQuery = 'UPDATE agreements set status_id = 5 WHERE uid = $1';
//   const addPaketInfo = 'INSERT INTO userpakets(paket_id, user_id, payment_uid) VALUES ($1, $2, $3)';
//
//   const getOffer = 'SELECT * FROM offers WHERE uid = $1';
//   const updateOffer = 'UPDATE offers SET status = $1 WHERE uid = $2';
//   const updateDialog = 'UPDATE dialogs SET dialog_status = $1, executor_id = $2 WHERE uid = $3';
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
//     if (dbResponse.status == 'success') {
//         return res.redirect('https://you-scribe.ru/api/v1/checkout/success');
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
//       'description': dbResponse.title + ' для ' + userData.user_name,
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
//               "description": dbResponse.title,
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
//             //dbQuery.query(updateAgreementQuery, [dbResponse.agr_uid]);
//
//             if (dbResponse.agr_uid) {
//               dbQuery.query(updateAgreementQuery, [dbResponse.agr_uid]);
//               if (source == 'web') {
//                 return res.redirect('https://you-scribe.ru/general#/agreement/' + dbResponse.agr_uid);
//               }
//               return res.redirect('https://you-scribe.ru/api/v1/checkout/success');
//             }
//             if (dbResponse.paket_id) {
//               dbQuery.query(addPaketInfo, [dbResponse.paket_id, dbResponse.user_id, uid]);
//               if (source == 'web') {
//                 return res.redirect('https://you-scribe.ru/general');
//               }
//               return res.redirect('https://you-scribe.ru/api/v1/checkout/success');
//             }
//             if (dbResponse.offer_id) {
//               (async() => {
//                 var resp = await dbQuery.query(getOffer, [dbResponse.offer_id]);
//
//                 var offer = resp.rows[0];
//
//                 if (offer.status == 'created') {
//                   dbQuery.query(updateOffer, ['prepaid', dbResponse.offer_id]);
//                   dbQuery.query(updateDialog, ['prepaid', offer.creator_id, offer.dialog_uid]);
//                 } else if (offer.status == 'prepaid') {
//                   dbQuery.query(updateOffer, ['fullpaid', dbResponse.offer_id]);
//                   dbQuery.query(updateDialog, ['fullpaid', offer.creator_id, offer.dialog_uid]);
//                 }
//                 // if (source == 'web') {
//                 //   return res.redirect('https://you-scribe.ru/general');
//                 // }
//                 return res.redirect('https://you-scribe.ru/api/v1/checkout/success');
//               })()
//             }
//             return res.redirect('https://you-scribe.ru/api/v1/checkout/success');
//           } else {
//             dbQuery.query(updatePaymentStatusQuery, ['failure', dbResponse.uid]);
//             return res.redirect('https://you-scribe.ru/api/v1/checkout/failure?reason=' + payment.cancellation_details.reason);
//           }
//           // return res.status(status.success).send(successMessage);
//         }
//
//         var return_url = "https://you-scribe.ru/api/v1/checkout/" + uid;
//
//         if (source == 'web') {
//           return_url += '?source=web';
//         }
//
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

  const { source } = req.query;

  const getPaymentQuery = 'SELECT * FROM payments WHERE uid = $1';
  const getUserData = 'SELECT phone, inn, email FROM users WHERE id = $1';
  const updatePaymentQuery = 'UPDATE payments SET tnkf_id = $1 WHERE uid = $2';
  const updatePaymentStatusQuery = 'UPDATE payments SET status = $1 WHERE uid = $2';
  const updateAgreementQuery = 'UPDATE agreements set status_id = 5 WHERE uid = $1';
  const addPaketInfo = 'INSERT INTO userpakets(paket_id, user_id, payment_uid) VALUES ($1, $2, $3)';

  const getOffer = 'SELECT * FROM offers WHERE uid = $1';
  const updateOffer = 'UPDATE offers SET status = $1 WHERE uid = $2';
  const updateDialog = 'UPDATE dialogs SET dialog_status = $1, executor_id = $2 WHERE uid = $3';

  var self = this;

  try {

    if (uid == "success") {
      return res.redirect('/general');
    }

    if (uid == "failure") {
      var data = req.query;
      data.PaymentURL = "https://you-scribe.ru/api/v1/checkout/" + data.OrderId;
      console.log(data);
      return res.status(status.success).render('pages/static/paymentFailure', data);
    }

    const {rows} = await dbQuery.query(getPaymentQuery, [uid]);
    const dbResponse = rows[0];

    if (!dbResponse) {
      errorMessage.message = "invalidID";
      return res.status(status.bad).send(errorMessage);
    }

    if (dbResponse.status == 'success') {
      return res.redirect('https://you-scribe.ru/api/v1/checkout/success');
    }

    const rawUserData = await dbQuery.query(getUserData, [dbResponse.user_id]);
    const userData = rawUserData.rows[0];

    const amount = dbResponse.amount.replace('.','');

    var request = require('request');

    var successURL = "https://you-scribe.ru/api/v1/checkout/" + uid

    if (source == 'web') {
      successURL += '?source=web';
    }

    if (dbResponse.tnkf_id) {
      var vals = env.tnkf_terminal_secret + dbResponse.tnkf_id + env.tnkf_terminal_id;
      var tfToken = crypto.createHash('sha256').update(vals).digest('hex');;
      console.log(vals);
      var checkTinkof = {
        "TerminalKey": env.tnkf_terminal_id,
        "PaymentId": dbResponse.tnkf_id,
        "Token": tfToken,
      };

      console.log(checkTinkof);
      request({
        url: "https://securepay.tinkoff.ru/v2/GetState",
        method: "POST",
        json: true,   // <--Very important!!!
        body: checkTinkof
      }, function (error, response, body){
        console.log(body);
        if (body.Status == "CONFIRMED") {
          dbQuery.query(updatePaymentStatusQuery, ['success', dbResponse.uid]);
          if (dbResponse.agr_uid) {
            dbQuery.query(updateAgreementQuery, [dbResponse.agr_uid]);
            if (source == 'web') {
              return res.redirect('https://you-scribe.ru/general#/agreement/' + dbResponse.agr_uid);
            }
            return res.redirect('https://you-scribe.ru/api/v1/checkout/success');
          }
          if (dbResponse.paket_id) {
            dbQuery.query(addPaketInfo, [dbResponse.paket_id, dbResponse.user_id, uid]);
            if (source == 'web') {
              return res.redirect('https://you-scribe.ru/general');
            }
            return res.redirect('https://you-scribe.ru/api/v1/checkout/success');
          }
          if (dbResponse.offer_id) {
            (async() => {
              var resp = await dbQuery.query(getOffer, [dbResponse.offer_id]);

              var offer = resp.rows[0];

              if (offer.status == 'created') {
                dbQuery.query(updateOffer, ['prepaid', dbResponse.offer_id]);
                dbQuery.query(updateDialog, ['prepaid', offer.creator_id, offer.dialog_uid]);

                self.renderCheckout.server.getWss().clients.forEach(function each(client) {
                  if (client.d_uid == req.params.uid) {
                    var response = {};
                    response.type = "status";
                    response.data = "prepaid";
                    client.send(JSON.stringify(response));
                  }
                });
                self.renderCheckout.server.getWss().clients.forEach(function each(client) {
                  if (client.d_uid == req.params.uid) {
                    var response = {};
                    response.type = "execOffer";
                    response.data = offer;
                    client.send(JSON.stringify(response));
                  }
                });

              } else if (offer.status == 'prepaid') {
                dbQuery.query(updateOffer, ['fullpaid', dbResponse.offer_id]);
                dbQuery.query(updateDialog, ['fullpaid', offer.creator_id, offer.dialog_uid]);

                self.renderCheckout.server.getWss().clients.forEach(function each(client) {
                  if (client.d_uid == req.params.uid) {
                    var response = {};
                    response.type = "status";
                    response.data = "fullpaid";
                    client.send(JSON.stringify(response));
                  }
                });
              }

              // if (source == 'web') {
              //   return res.redirect('https://you-scribe.ru/general');
              // }
              return res.redirect('https://you-scribe.ru/api/v1/checkout/success');
            })()
          }
        }
      })


    } else {

      var createTinkof = {
        "TerminalKey": env.tnkf_terminal_id,
        "Amount": amount,
        "OrderId": uid,
        "Description": dbResponse.title,
        "SuccessURL": successURL,
        "DATA": {
          "Phone": userData.phone,
        },
        "Receipt": {
          "Phone": userData.phone,
          "EmailCompany": "info@you-scribe.ru",
          "Taxation": "usn_income",
          "Items": [
            {
              "Name": dbResponse.title,
              "Price": amount,
              "Quantity": 1.00,
              "Amount": amount,
              "PaymentMethod": "full_prepayment",
              "PaymentObject": "service",
              "Tax": "none"
            }
          ]
        }
      };

      if (userData.email) {
        createTinkof["DATA"]["Email"] = userData.email
        createTinkof["Receipt"]["Email"] = userData.email
      }
      
      console.log(createTinkof);
      request({
        url: "https://securepay.tinkoff.ru/v2/Init",
        method: "POST",
        json: true,   // <--Very important!!!
        body: createTinkof
      }, function (error, response, body){
        console.log(body);
        if (body.Success) {
          console.log(body.PaymentId);
          console.log(body.PaymentURL);
          dbQuery.query(updatePaymentQuery, [body.PaymentId, dbResponse.uid]);
          return res.redirect(body.PaymentURL);
        } else {
          return res.status(status.success).render('pages/static/errorPage', {Message: body.Message});
        }
      });
    }

  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

export {
  createPayment,
  renderCheckout,
  checkIAP,
  checkPromoCode
};
