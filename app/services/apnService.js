var apn = require('apn');

var options = {
  token: {
    key: "AuthKey_6RRTAM22X5.p8",
    keyId: "6RRTAM22X5",
    teamId: "A7FRCYXJJN"
  },
  production: false
};

const APNProvider = new apn.Provider(options);

const sendAPNPush = (title, body, deviceToken, payload) => {

  let notification = new apn.Notification();

  notification.title = title;
  notification.body = body;
  notification.sound = "default";
  notification.topic = "com.tommysirenko.yousterssubsapp";
  notification.payload = payload

  apnProvider.send(notification, deviceToken).then( (result) => {
    console.log(result.sent);
    console.log(result.failed);
  });
}

export default sendAPNPush;
