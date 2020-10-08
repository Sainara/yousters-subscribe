const AWS = require('aws-sdk');
var multer  = require('multer')
var multerS3 = require('multer-s3')

import { v4 as uuidv4 } from 'uuid';

// Enter copied or downloaded access ID and secret key here
// const ID = 'AKIAIC7YAIR2JRJPVQBQ';
// const SECRET = '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';

const ID = 'vh2Q2YYym0jqMQFefY8-';
const SECRET = 'c-IkYLU8-Gfn-8WLgAnpn8gJaWjORcZOIhqfEWo1';

// The name of the bucket that you have created
const BUCKET_NAME = 'you-scribe-main-bucket';

const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET,
    region: 'ru-central1',
    endpoint: 'storage.yandexcloud.net'
});

const uploader = multer({
  storage: multerS3({
    s3: s3,
    bucket: BUCKET_NAME,
    acl: 'public-read',
    storageClass: 'COLD',
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

const s3upload = (data, ct, key) => {
  return new Promise((resolve, reject) => {
    var params = {
      ACL: 'public-read',
      Body: data,
      ContentType: ct,
      Bucket: BUCKET_NAME,
      Key: key
     };
     console.log(ct);
     s3.putObject(params, function(err, data) {
       if (err) {
         console.log(err, err.stack);
         reject(err);
       } else {
        console.log(data);
        resolve(data);
      }        // successful response
     });
  });
}

const s3get = (key) => {
  return new Promise((resolve, reject) => {
    var params = {
      Bucket: BUCKET_NAME,
      Key: key
     };
     s3.getObject(params, function(err, data) {
       if (err) {
         console.log(err, err.stack);
         reject(err);
       } else {
         console.log(data);
         resolve(data);
       }

     });
  });
}

const s3delete = (key) => {
  return new Promise((resolve, reject) => {
    var params = {
      Bucket: BUCKET_NAME,
      Key: key
     };
     s3.deleteObject(params, function(err, data) {
       if (err) {
         console.log(err, err.stack);
         reject(err);
       } else {
         console.log(data);
         resolve(data);
       }
     });
  });
}
//
export {
  uploader,
  s3upload,
  s3get,
  s3delete
};
