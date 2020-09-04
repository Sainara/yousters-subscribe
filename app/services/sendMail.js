import env from '../../env';

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(env.sendGridMailAPIKey);

const sendMail = async (to, from, subject, html) => {

  const msg = {
    to: to,
    from: from,
    subject: subject,
    html: '<p>' + html + '</p>',
  };
  sgMail.send(msg);

}

export default sendMail;
