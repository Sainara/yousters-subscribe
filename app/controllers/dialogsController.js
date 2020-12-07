import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import dbQuery from '../db/dbQuery';

import {
  hashPassword,
  isValidEmail,
  isValidNameLength,
  validatePassword,
  isEmpty,
} from '../helpers/validations';

import {
  generateCode,
  generateUserToken,
  generateFileHash,
  generateEmojiHash
} from '../helpers/generators';

import {
  eMessage, sMessage, status,
} from '../helpers/status';

import {snsPublish} from '../helpers/sns';
import {s3delete} from '../helpers/s3';

import sendNotification from '../services/notificationService';

const getDialogs = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const getQuery = 'SELECT id, title, uid, dialog_type, dialog_status from dialogs WHERE creator_id = $1 ORDER BY created_at DESC';

  try {

    var { rows } = await dbQuery.query(getQuery, [req.user.id]);

    successMessage.data = rows
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

const createDialog = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  var { title, type } = req.body;

  if (title == "") {
    title = uuidv4();
  }

  if (!isValidNameLength(title)) {
    errorMessage.message = "inValidName";
    return res.status(status.bad).send(errorMessage);
  }

  const content = "Здравствуйте, давайте начнем составление договора!\
\n\nВот несколько вопросов:\nКакой договор вам нужно сделать?\
\nНа какие риски вы хотите обратить особое внимание? Расскажите, что для вас особенно важно в этом договоре\
\nИнтересы какой стороны должны быть защищены наилучшим образом? Этот договор защищает обе стороны в одинаково или дает больше преимущества определенной стороне?\
\nПрикрепите все необходимые файлы, которые имеют отношение к делу\
\n\nПока вы будете рассказывать какой договор вам нужен, мы уже будем подбирать вам юристов, чтобы вы могли выбрать исполнителя";

  const createQuery = 'INSERT INTO dialogs (title, creator_id, uid, dialog_type, dialog_status) VALUES ($1, $2, $3, $4, $5) RETURNING id, uid';
  const createMessageQuery = 'INSERT INTO messages (m_content, m_type, creator_id, dialog_uid) VALUES ($1, $2, $3, $4)';


  try {

    var { rows } = await dbQuery.query(createQuery, [title, req.user.id, uuidv4(), type, "created"]);

    var vals = [content, "text", 1, rows[0].uid];
    var a = await dbQuery.query(createMessageQuery, vals);

    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

const getMessages = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const { dialog_id } = req.query;

  const getQuery = 'SELECT * from messages WHERE dialog_id = $1';

  try {

    var { rows } = await dbQuery.query(getQuery, [dialog_id]);
    successMessage.data = rows;
    //successMessage.data.dialogId = rows[0].id;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};


const createMessage = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const { content, type } = req.body;

  var self = this;

  const createQuery = 'INSERT INTO messages (m_content, m_type, creator_id, dialog_uid) VALUES ($1, $2, $3, $4) RETURNING *';
  const getDialogInfo = 'SELECT * FROM dialogs WHERE uid = $1';

  try {
    var vals;
    var notificationText = "";

    switch (type) {
      case "text":
        if (content == "") {
          return res.status(status.bad).send(errorMessage);
        }
        vals = [content, type, req.user.id, req.params.uid];
        notificationText = content;
        break;
      case "image":
      case "document":
        var uid = "message-media-" + type + uuidv4();
        vals = [req.file.location, type, req.user.id, req.params.uid];
        notificationText = "📎 Вложение"
        break;
      default:
        return res.status(status.bad).send(errorMessage);
    }

    var { rows } = await dbQuery.query(createQuery, vals);

    self.createMessage.server.getWss().clients.forEach(function each(client) {
      if (client.d_uid == req.params.uid) {
        var response = {};
        response.type = "message";
        response.data = rows;

        client.send(JSON.stringify(response));
      }
    });

    var dialogRaw = await dbQuery.query(getDialogInfo, [req.params.uid]);

    var dialog = dialogRaw.rows[0];

    if (dialog) {
      sendNotification(dialog.title, notificationText, dialog.creator_id, {deepLink: "https://you-scribe.ru/dialog/" + req.params.uid});
    }

    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

const createOffer = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const { description, price, dialog_id } = req.body;

  const getLawyer = 'SELECT * FROM lawyers WHERE id = $1';
  const checkQuery = 'SELECT * FROM offers WHERE creator_id = $1 AND dialog_uid = $2';
  const createQuery = 'INSERT INTO offers (title, price, description, status, uid, dialog_uid, creator_id, level) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *';

  const getDialogInfo = 'SELECT * FROM dialogs WHERE uid = $1';

  var self = this;

  try {

    var check = await dbQuery.query(checkQuery, [req.user.id, dialog_id]);

    if (check.rows[0]) {
      errorMessage.message = "offerAlreadyExist";
      return res.status(status.bad).send(errorMessage);
    }

    var data = await dbQuery.query(getLawyer, [req.user.id]);

    var vals = [data.rows[0].user_name, price, description, "created", uuidv4(), dialog_id, req.user.id, req.user.level];
    var { rows } = await dbQuery.query(createQuery, vals);
    successMessage.data = rows[0];

    self.createOffer.server.getWss().clients.forEach(function each(client) {
      if (client.d_uid == dialog_id) {
        var response = {};
        response.type = "offer";
        response.data = rows;

        client.send(JSON.stringify(response));
      }
    });

    var dialogRaw = await dbQuery.query(getDialogInfo, [dialog_id]);
    var dialog = dialogRaw.rows[0];

    if (dialog) {
      var notificationText = "Поступило предложение от юриста: " + price + "₽";
      sendNotification(dialog.title, notificationText, dialog.creator_id, {deepLink: "https://you-scribe.ru/dialog/" + req.params.uid});
    }

    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

const makeWaitFullPay = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const updateQuery = 'UPDATE dialogs SET dialog_status = $1 WHERE uid = $2';

  try {
    var newStatus = "waitfullpay";
    var vals = [newStatus, req.params.uid];
    var { rows } = await dbQuery.query(updateQuery, vals);
    successMessage.data = newStatus;

    this.makeWaitFullPay.server.getWss().clients.forEach(function each(client) {
      if (client.d_uid == req.params.uid) {
        var response = {};
        response.type = "status";
        response.data = newStatus;

        client.send(JSON.stringify(response));
      }
    });

    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};




export {
  getDialogs,
  createDialog,
  getMessages,
  createMessage,
  createOffer,
  makeWaitFullPay
};
