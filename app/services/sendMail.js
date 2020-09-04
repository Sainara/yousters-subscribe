import env from '../../env';

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(env.sendGridMailAPIKey);

const sendMail = async (to, from, subject, text, html) => {

  const msg = {
    to: to,
    from: from,
    subject: subject,
    text: text,
    html: html,
  };
  sgMail.send(msg);

}

export default sendMail;
