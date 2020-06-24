const AWS = require('aws-sdk');

// Enter copied or downloaded access ID and secret key here
const ID = 'AKIAIC7YAIR2JRJPVQBQ';
const SECRET = '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';

const sns = new AWS.SNS({
    accessKeyId: ID,
    secretAccessKey: SECRET,
    region: 'eu-central-1'
});

const snsPublish = (phone, message) => {
  return new Promise((resolve, reject) => {
    var params = {
      Message: message, /* required */
      PhoneNumber: phone,
    };
    sns.publish(params, function(err, data) {
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


export {
  snsPublish
};
