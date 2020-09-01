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

  var total = data.ContentLength
    console.log(req.headers);

    if (req.headers['range']) {


                // We store the header in a variable
                let range = req.headers['range'];

                console.log(range);
                // Then we remove the first part and split the string in every dash "-"
                var array = range.replace('bytes=', "").split("-");
                // After that we store the number where we start to read our buffer;
                var start = parseInt(array[0], 10);
                // We check if there is and end, if not, we just send the total size of the file
                // Total size is total -1, because we start counting from the 0.
                // data.size returns the size, "data" is the object that fs.stat outputs.
                var end = array[1] ? parseInt(array[1], 10) : data.ContentLength - 1;
                // Here we decide the size of every chunck we will be sending
                var chunck = (end - start) + 1;
                // And then we set the headers and status code 206
                res.writeHead(206, {
                    // We tell the units that we use to messure the ranges
                    'Accept-Ranges': 'bytes',
                    // We tell the range of the content that we are sending
                    "Content-Range": "bytes " + start + "-" + end + "/" + data.ContentLength,
                    // Tell the length of the chunck. We use this to control the flow of the stream.
                    // The "chunck" is a variable that we set in line 38 of this gist.
                    'Content-Length': chunck,
                    // Set the MIME-type
                    'Content-Type': data.ContentType,
                    // And also set that we dont want to cache out file
                    // This is just to make our example work as if allways were the first time we ask the file.
                    'Cache-Control': 'no-cache'
                });

                // If the ranges headers can't be fulfilled, we will be sending a stream anyway,
                // but the browser will need to assume things and slow down the process.

                // Time to make our readable stream
                // First we create a readableStream and store in a variable
                // We pass the start and end parameters so NodeJS can know wich part needs to read and send as buffer.
                let readable = streamifier.createReadStream(data.Body, { start, end });
                console.log(readable);
                readable.pipe(res);
                // If for some reason we cant create our Readable Strea, we end the response.
                if (readable == null) {
                    console.log('readable = null');
                    return res.end();
                // If not...
                } else {
                    // First we use the event .on('open') to listen when the readable is ready to rock
                    // Then we provide a function to pipe to res.
                    readable.on('open', () => {
                        console.log('we are on open');
                        // This function is esential. Here we are puting all the buffer chunk to the response object.
                        readable.pipe(res);
                    });
                    // We also be waiting for that umpleasing error event.
                    readable.on('error', (err) => {
                      // If it happen, we will send the error with the .end() method.
                        res.end(err);
                        console.log(err);
                    });

                }
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
