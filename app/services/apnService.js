var apn = require('apn');

const token = {
  key: process.cwd() + "/static/AuthKey_6RRTAM22X5.p8",
  keyId: "6RRTAM22X5",
  teamId: "A7FRCYXJJN"
};

const DEVOptions = {
  token: token,
  production: false
};

const PRODOptions = {
  token: token,
  production: true
};

const DEVAPNProvider = new apn.Provider(DEVOptions);
const APNProvider = new apn.Provider(PRODOptions);

const sendAPNPush = (title, body, deviceToken, payload) => {

  let notification = new apn.Notification();

  notification.title = title;
  notification.body = body;
  notification.sound = "default";
  notification.topic = "com.tommysirenko.yousterssubsapp";
  notification.payload = payload

  APNProvider.send(notification, deviceToken).then( (result) => {
    console.log(result.sent);
    console.log(result.failed);
  });
  DEVAPNProvider.send(notification, deviceToken).then( (result) => {
    console.log(result.sent);
    console.log(result.failed);
  });
}

export default sendAPNPush;
