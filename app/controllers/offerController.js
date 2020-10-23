import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import dbQuery from '../db/dbQuery';


import {
  eMessage, sMessage, status,
} from '../helpers/status';

import {snsPublish} from '../helpers/sns';

import sendNotification from '../services/notificationService';

const getDialogs = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const getQuery = 'SELECT id, title, uid, dialog_type, dialog_status, created_at from dialogs WHERE dialog_status = $1';

  try {

    var { rows } = await dbQuery.query(getQuery, ["created"]);

    successMessage.data = rows
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};

// const createDialog = async (req, res) => {
//
//   const errorMessage = Object.assign({}, eMessage);
//   const successMessage = Object.assign({}, sMessage);
//
//   const { title, type } = req.body;
//
//   if (!isValidNameLength(title)) {
//     errorMessage.message = "inValidName";
//     return res.status(status.bad).send(errorMessage);
//   }
//
//   const content = "Здравствуйте, давайте начнем составление договора!\n\nПока вы будете рассказывать какой договор вам нужен, мы уже будет подбирать вам юристов, чтобы вы могли выбрать исполнител";
//
//   const createQuery = 'INSERT INTO dialogs (title, creator_id, uid, dialog_type, dialog_status) VALUES ($1, $2, $3, $4, $5) RETURNING id, uid';
//   const createMessageQuery = 'INSERT INTO messages (m_content, m_type, creator_id, dialog_uid) VALUES ($1, $2, $3, $4)';
//
//
//   try {
//
//     var { rows } = await dbQuery.query(createQuery, [title, req.user.id, uuidv4(), type, "created"]);
//
//     var vals = [content, "text", 1, rows[0].uid];
//     var a = await dbQuery.query(createMessageQuery, vals);
//
//     return res.status(status.success).send(successMessage);
//   } catch (error) {
//     console.error(error);
//     return res.status(status.bad).send(errorMessage);
//   }
// };
//
// const getMessages = async (req, res) => {
//
//   const errorMessage = Object.assign({}, eMessage);
//   const successMessage = Object.assign({}, sMessage);
//
//   const { dialog_id } = req.query;
//
//   const getQuery = 'SELECT * from messages WHERE dialog_id = $1';
//
//   try {
//
//     var { rows } = await dbQuery.query(getQuery, [dialog_id]);
//     successMessage.data = rows;
//     //successMessage.data.dialogId = rows[0].id;
//     return res.status(status.success).send(successMessage);
//   } catch (error) {
//     console.error(error);
//     return res.status(status.bad).send(errorMessage);
//   }
// };
//
//
// const createMessage = async (req, res) => {
//
//   const errorMessage = Object.assign({}, eMessage);
//   const successMessage = Object.assign({}, sMessage);
//
//   const types = ["text"];
//
//   const { content, type, dialog_id } = req.body;
//
//   if (!types.includes(type)) {
//     errorMessage.message = "invalidType"
//     return res.status(status.bad).send(errorMessage);
//   }
//
//   const createQuery = 'INSERT INTO messages (m_content, m_type, creator_id, dialog_id) VALUES ($1, $2, $3, $4) RETURNING *';
//
//   try {
//     var vals = [content, type, req.user.id, dialog_id];
//     var { rows } = await dbQuery.query(createQuery, vals);
//     successMessage.data = rows[0];
//     return res.status(status.success).send(successMessage);
//   } catch (error) {
//     console.error(error);
//     return res.status(status.bad).send(errorMessage);
//   }
// };

const createOffer = async (req, res) => {

  const errorMessage = Object.assign({}, eMessage);
  const successMessage = Object.assign({}, sMessage);

  const { description, price, dialog_id } = req.body;

  const createQuery = 'INSERT INTO offers (title, price, description, status, uid, dialog_uid, creator_id, level) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *';

  try {

    var vals = ["title", price, description, "created", uuidv4(), dialog_id, req.user.id, req.user.level];
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

    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};



export {
  getDialogs,
  // createDialog,
  // getMessages,
  // createMessage,
  createOffer
};
