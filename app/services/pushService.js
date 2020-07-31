import sendAPNPush from './apnService';


const sendPush = (title, body, deviceInfo, payload) => {

  if (deviceInfo.type = 'ios') {
    sendAPNPush(title, body, deviceInfo.token, payload);
  } else {
    console.log('uknownType');
  }

}

export default sendPush;
