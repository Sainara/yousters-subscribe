const AWS = require('aws-sdk');
var multer  = require('multer')
var multerS3 = require('multer-s3')

import { v4 as uuidv4 } from 'uuid';

// Enter copied or downloaded access ID and secret key here
const ID = 'AKIAIC7YAIR2JRJPVQBQ';
const SECRET = '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';

// The name of the bucket that you have created
const BUCKET_NAME = 'yousterssubs';

const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
});

const uploader = multer({
  storage: multerS3({
    s3: s3,
    bucket: BUCKET_NAME,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      var phone = req.user.phone.substr(1)
      var uid = uuidv4()+"-"+phone;
      cb(null, uid)
    }
  })
})

export default uploader;
