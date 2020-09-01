import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import dbQuery from '../db/dbQuery';
var sha256File = require('sha256-file');

var streamifier = require('streamifier');

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
  generateEmojiHash
} from '../helpers/generators';

import {
  eMessage, sMessage, status,
} from '../helpers/status';

import {s3get} from '../helpers/s3';

import notFoundRoute from '../../publicApp/routes/404Route';

const renderCase = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const { uid } = req.params;

  const getQuery = 'SELECT * FROM agreements WHERE uid = $1';
  const getSubsQuery = 'SELECT s.created_at, u.inn, u.phone, u.user_name FROM subscribtion as s inner join users as u on s.subs_id = u.id WHERE s.agr_uid = $1';

  try {

    const { rows } = await dbQuery.query(getQuery, [uid]);
    const dbResponse = rows[0];

    dbResponse.hash = generateEmojiHash(dbResponse.hash);

    if (!dbResponse) {
      errorMessage.message = "invalid sessionid";
      notFoundRoute(req, res)
    }

    const subs = await dbQuery.query(getSubsQuery, [uid]);
    subs.rows.forEach(function(item, i, arr) {
      for (var g = 6; g < 10; g++) {
          var index = g;
          item.phone = item.phone.substring(0, index) + '*' + item.phone.substring(index + 1);
      }

    });
    dbResponse.link = "https://you-scribe.ru/doc/" + uid
    const results = {
      'agreement': dbResponse,
      'subs' : subs.rows
     };
    res.render('pages/case', results);
  } catch (error) {
    console.error(error);
    notFoundRoute(req, res)
  }
};

const renderDoc = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const { uid } = req.params;

  const getQuery = 'SELECT link FROM agreements WHERE uid = $1';

  try {

    const { rows } = await dbQuery.query(getQuery, [uid]);
    const dbResponse = rows[0];

    if (!dbResponse) {
      errorMessage.message = "invalidSessionID";
      return res.status(status.bad).send(errorMessage);
    }

    var key = dbResponse.link.split('/').pop()
    var data = await s3get(key);

    res.set('Content-type', 'application/pdf');
    res.send(data.Body);
  } catch (error) {
    console.error(error);
    notFoundRoute(req, res)
  }
};

const renderSubVideo = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const { uid } = req.params;

  const getQuery = 'SELECT video_url FROM subscribtion WHERE uid = $1';

  try {

    const { rows } = await dbQuery.query(getQuery, [uid]);
    const dbResponse = rows[0];

    if (!dbResponse) {
      errorMessage.message = "invalidSubscribtionID";
      return res.status(status.bad).send(errorMessage);
    }

    var key = dbResponse.video_url.split('/').pop()
    var data = await s3get(key);

    if (req.headers.range) {

      var total = data.ContentLength
      // meaning client (browser) has moved the forward/back slider
      // which has sent this request back to this server logic ... cool

      var range = req.headers.range;
      var parts = range.replace(/bytes=/, "").split("-");
      var partialstart = parts[0];
      var partialend = parts[1];

      var start = parseInt(partialstart, 10);
      var end = partialend ? parseInt(partialend, 10) : total-1;
      var chunksize = (end-start)+1;
      console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);

      var file = streamifier.createReadStream(data.Body, {start: start, end: end});
      res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': data.ContentType });
      file.pipe(res);

    } else {

      console.log('ALL: ' + total);
      res.writeHead(200, { 'Content-Length': total, 'Content-Type': data.ContentType });
      streamifier.createReadStream(data.Body).pipe(res);
    }

  } catch (error) {
    console.error(error);
    notFoundRoute(req, res)
  }
};

export {
  renderCase,
  renderDoc,
  renderSubVideo
};
