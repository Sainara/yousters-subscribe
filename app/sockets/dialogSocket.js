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
import {s3delete, s3upload} from '../helpers/s3';

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

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
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

  var self = this;

  ws.on('message', function(msg) {

    var msgUTF = msg.toString('utf-8');

    if (IsJsonString(msgUTF)) {
      var json = JSON.parse(msgUTF);

      switch (json.type) {
        case "offer":

          break;
        default:
          break;
      }
    } else {

      var msgLatin1 = msg.toString('latin1');

      const boundary = getBoundary(msgLatin1);
      if (!boundary) {
        //endRequestWithError(response, body, 400, 'Boundary information missing', callback)
        return
      }
      let result = {}
      const rawDataArray = msgLatin1.split(boundary)

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

      const createQuery = 'INSERT INTO messages (m_content, m_type, creator_id, dialog_uid) VALUES ($1, $2, $3, $4) RETURNING *';

      try {
        (async() => {

          var vals;

          switch (result['type']) {
            case "text":
              var text = Buffer.from(result['content'], 'latin1').toString('utf-8');
              if (text == "") {
                return ;
              }
              vals = [text, result['type'], req.user.id, req.params.uid];

              break;
            case "image":
            case "document":
            case "voice":
              var uid = "message-media-" + result['type'] + uuidv4();
              var imageData = await s3upload(Buffer.from(result.files[0]['content'], 'latin1'), result.files[0]['Content-Type'], uid);
              vals = [imageData.Location, result['type'], req.user.id, req.params.uid];
              break;
            default:
              return
          }

          var { rows } = await dbQuery.query(createQuery, vals);

          self.connectToDialog.server.getWss().clients.forEach(function each(client) {
            if (client.d_uid == req.params.uid) {
              var response = {};
              response.type = "message";
              response.data = rows;

              client.send(JSON.stringify(response));
            }
          });
        })()
      } catch (error) {
        console.error(error);
      }
    }
  });

  console.log('connection');
  ws.d_uid = req.params.uid;

  const getMessagesQuery = 'SELECT * from messages WHERE dialog_uid = $1';

  try {
    var { rows } = await dbQuery.query(getMessagesQuery, [req.params.uid]);
    var response = {};
    response.type = "message";
    response.data = rows;
    ws.send(JSON.stringify(response));
  } catch (error) {
    console.error(error);
  }

  const getOffersQuery = 'SELECT * from offers WHERE dialog_uid = $1';

  try {
    var { rows } = await dbQuery.query(getOffersQuery, [req.params.uid]);
    var response = {};
    response.type = "offer";
    response.data = rows;
    ws.send(JSON.stringify(response));
  } catch (error) {
    console.error(error);
  }
};


export {
  connectToDialog
};
