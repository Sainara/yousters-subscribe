import sendPush from './pushService';

import dbQuery from '../db/dbQuery';

const sendNotification = async (title, body, user_id, payload) => {

  const tryFindDeviceToken = 'SELECT * FROM device_tokens WHERE user_id = $1';

  try {
    const deviceTokens = await dbQuery.query(tryFindDeviceToken, [user_id]);
    const deviceTokensResult = deviceTokens.rows;

    if (deviceTokensResult.length > 0) {
      for (var i = 0; i < deviceTokensResult.length; i++) {
        const deviceInfo = {
          type: deviceTokensResult[i].device_type,
          token: deviceTokensResult[i].token
        };
        sendPush(title, body, deviceInfo, payload);
      }
    }



  } catch (e) {
    console.error(e);
  }

}

export default sendNotification;
