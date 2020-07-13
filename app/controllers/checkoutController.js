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

import {s3get} from '../helpers/s3';

const renderCheckout = async (req, res) => {

  //const { uid } = req.params;

  const getQuery = 'SELECT * FROM agreements WHERE uid = $1';
  const getSubsQuery = 'SELECT s.created_at, u.inn, u.phone, u.user_name FROM subscribtion as s inner join users as u on s.subs_id = u.id WHERE s.agr_uid = $1';

  try {

    // const { rows } = await dbQuery.query(getQuery, [uid]);
    // const dbResponse = rows[0];
    //
    // if (!dbResponse) {
    //   errorMessage.message = "invalid sessionid";
    //   return res.status(status.bad).send(errorMessage);
    // }
    //
    // const subs = await dbQuery.query(getSubsQuery, [uid]);
    // subs.rows.forEach(function(item, i, arr) {
    //   for (var g = 6; g < 10; g++) {
    //       var index = g;
    //       item.phone = item.phone.substring(0, index) + '*' + item.phone.substring(index + 1);
    //   }
    //
    // });
    // dbResponse.link = "https://you-scribe.ru/doc/" + uid
    var return_url = "confirmation_token"
    const result = {
      confirmation_token: return_url,
      return_url: return_url,
     };
    res.render('pages/yandexCheckout', result
  );
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

export {
  renderCheckout
};
