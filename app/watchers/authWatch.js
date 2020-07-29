import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import dbQuery from '../db/dbQuery';

import {
  eMessage, sMessage, status,
} from '../helpers/status';

import env from '../../env';

const request = require('request');

const nonPhizValidationWatcher = async () => {

  const select = "SELECT inn FROM users WHERE is_on_validation = true AND validation_type = 'nonPhiz'";
  const activateQuery = "UPDATE users SET user_name = $2, is_on_validation = false, isvalidated = true WHERE inn = $1";

  try {
      const selectRes = await dbQuery.query(select, []);
      const waitors = selectRes.rows;
      if (waitors.length > 0) {
        const from = moment().subtract(5, 'd');

        request({
            url: "https://business.tinkoff.ru/openapi/api/v1/bank-statement?accountNumber=40802810800001566018&from=" + from.format("YYYY-MM-DD"),
            method: "GET",
            headers: {
              'Authorization': "Bearer " + env.tnkf_openAPI_id,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
        }, function (error, response, body){

          const operations = JSON.parse(body).operation;

          for (var i = 0; i < operations.length; i++) {
            for (var g = 0; g < waitors.length; g++) {
              if (waitors[g].inn == operations[i].payerInn) {
                 dbQuery.query(activateQuery, [waitors[g].inn, operations[i].payerName]);
                 console.log(waitors[g].inn + ' is activated with name - ' + operations[i].payerName);
              }
            }
          }
        });
      } else {
        console.log('Not waiters in queue');
      }
  } catch (e) {
    console.log(e);
  }



};

export default nonPhizValidationWatcher;
