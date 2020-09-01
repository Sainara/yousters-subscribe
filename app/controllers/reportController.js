import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import dbQuery from '../db/dbQuery';

import {
  eMessage, sMessage, status,
} from '../helpers/status';

import env from '../../env';

const subscribtionReport = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const { sub_uid, reason } = req.body;
  const checkExistOfSub = 'SELECT agr_uid FROM subscribtion WHERE subs_id = $1';
  const checkReportExistance = 'SELECT * FROM subs_reports WHERE sub_uid = $1 AND reason = $2 AND status = $3';
  const createReport = 'INSERT INTO subs_reports(sub_uid, reason, status, created_at) VALUES ($1, $2, $3, $4)';

  try {
    var { rows } = await dbQuery.query(checkExistOfSub, [sub_uid]);
    const dbResponse = rows[0];

    if (!dbResponse) {
      errorMessage.message = "subNotExist";
      return res.status(status.bad).send(errorMessage);
    }
    console.log("exist");

    var checkReportExistanceResp = await dbQuery.query(checkReportExistance, [sub_uid, reason, "created"]);
    const checkReportExistanceRespdbResponse = checkReportExistanceResp.rows[0];

    if (checkReportExistanceRespdbResponse) {
      errorMessage.message = "reportAlreadyExist";
      return res.status(status.bad).send(errorMessage);
    }
    console.log("exist 2");

    var createReportResp = await dbQuery.query(createReport, [sub_uid, reason, 'created', moment()]);

    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};



export {
  subscribtionReport
};
