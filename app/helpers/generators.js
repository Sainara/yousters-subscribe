import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const https = require('https');
const crypto = require('crypto');
const fs = require("fs");

import env from '../../env';
//

const generateFileHash = (url) => {
  return new Promise((resolve, reject) => {
    var sum = crypto.createHash('sha256');


    var request = https.request(url, function (res) {
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('data', function (chunk) {
            sum.update(chunk)
        });
        res.on('end', function () {
            resolve(sum.digest('hex'));
        });
    });
    request.on('error', function (e) {
        console.log(e.message);
        reject(err);
    });
    request.end();
  });
}

const generateCode = (n) => {
        var add = 1, max = 12 - add;   // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.

        if ( n > max ) {
                return generate(max) + generate(n - max);
        }

        max        = Math.pow(10, n+add);
        var min    = max/10; // Math.pow(10, n) basically
        var number = Math.floor( Math.random() * (max - min + 1) ) + min;

        return ("" + number).substring(add);
}

const generateUserToken = (id, phone, isvalidated) => {
  const token = jwt.sign({
    id,
    phone,
    isvalidated,
  },
  env.secret, { expiresIn: '10y' });
  return token;
};

const generateEmojiHash = (hash) => {
  //console.log(process.cwd());
  let fileContent = fs.readFileSync(process.cwd() + "/static/hashEmoji.txt", "utf8");
  const emojis = fileContent.split("\n");

  var result = ""

  const length_ = hash.length / 4

  const arr = hash.match(/.{1,16}/g)

  for (var i = 0; i < arr.length; i++) {
    var str = arr[i]
    var sum = 0
    for (var g = 0; g < str.length; g++) {

      sum += str.charCodeAt(g);
    }
    result += emojis[sum % 256];
  }

  return result;
};

export {
  generateCode,
  generateUserToken,
  generateFileHash,
  generateEmojiHash
};
