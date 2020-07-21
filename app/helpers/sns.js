import env from '../../env';

const SMSRU = new SMSru(env.sms_ru_api_id);

const snsPublish = (phone, message) => {
  SMSRU.sms_send({
    to: phone,
    text: message
  }, function(e){
    console.log(e.description);
  });
}


export {
  snsPublish
};
