import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import dbQuery from '../db/dbQuery';

import {
  hashPassword,
  isValidEmail,
  isValidNameLength,
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

import {snsPublish} from '../helpers/sns';
import {s3delete} from '../helpers/s3';

import sendNotification from '../services/notificationService';


function getBoundary(request) {
  let contentType = request.split('\n')[0];
  const contentTypeArray = contentType.split(';').map(item => item.trim())
  const boundaryPrefix = 'boundary='
  let boundary = contentTypeArray.find(item => item.startsWith(boundaryPrefix))
  if (!boundary) return null
  boundary = boundary.slice(boundaryPrefix.length)
  if (boundary) boundary = boundary.trim()
  return boundary
}

function getMatching(string, regex) {
  // Helper function when using non-matching groups
  const matches = string.match(regex)
  if (!matches || matches.length < 2) {
    return null
  }
  return matches[1]
}

const connectToDialog = async (ws, req) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  ws.on('open', function open() {
    console.log('connected');
    console.log(req.user.phone);
  });

  ws.on('close', function close() {
    console.log('disconnected');
  });

    ws.on('message', function(msg) {
      console.log(msg.toString('utf8'));

      const boundary = getBoundary(msg.toString('utf8'))
        if (!boundary) {
          endRequestWithError(response, body, 400, 'Boundary information missing', callback)
          return
        }
        let result = {}
        const rawDataArray = msg.toString('utf8').split(boundary)
        for (let item of rawDataArray) {
          // Use non-matching groups to exclude part of the result
          let name = getMatching(item, /(?:name=")(.+?)(?:")/)
          if (!name || !(name = name.trim())) continue
          let value = getMatching(item, /(?:\r\n\r\n)([\S\s]*)(?:\r\n--$)/)
          if (!value) continue
          let filename = getMatching(item, /(?:filename=")(.*?)(?:")/)
          if (filename && (filename = filename.trim())) {
            // Add the file information in a files array
            let file = {}
            file[name] = value
            file['filename'] = filename
            let contentType = getMatching(item, /(?:Content-Type:)(.*?)(?:\r\n)/)
            if (contentType && (contentType = contentType.trim())) {
              file['Content-Type'] = contentType
            }
            if (!result.files) {
              result.files = []
            }
            result.files.push(file)
          } else {
            // Key/Value pair
            result[name] = value
          }
        }
        //console.log(result);

      const types = ["text"];


      if (!types.includes(result['type'])) {
        return
      }

      //console.log();

      const createQuery = 'INSERT INTO messages (m_content, m_type, creator_id, dialog_uid) VALUES ($1, $2, $3, $4) RETURNING *';

      try {
        (async() => {
          var vals = [result['content'], result['type'], req.user.id, req.params.uid];
          var { rows } = await dbQuery.query(createQuery, vals);
        //console.log(JSON.stringify(rows));
            this.getWss().clients.forEach(function each(client) {
              //if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(rows));
              //}
            });
          //ws.send();
        })()

        //return res.status(status.success).send(successMessage);
      } catch (error) {
        console.error(error);
        //eeeturn res.status(status.bad).send(errorMessage);
      }

      //JSON.stringify(successMessage));

    });

    //v
    //ws.send(req.params.uid)


    console.log('connection');

  //const { dialog_id } = req.params.uid;

  // if (!isValidNameLength(title)) {
  //   errorMessage.message = "inValidName";
  //   return res.status(status.bad).send(errorMessage);
  // }

  const getQuery = 'SELECT * from messages WHERE dialog_uid = $1';

  try {

    var { rows } = await dbQuery.query(getQuery, [req.params.uid]);

    // if () {
    //
    // }
    //console.log(JSON.stringify(rows));

    console.log(this.getWss().clients);

    ws.send(JSON.stringify(rows));
    //successMessage.data.dialogId = rows[0].id;
    //return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    //return res.status(status.bad).send(errorMessage);
  }
};




export {
  connectToDialog
};
