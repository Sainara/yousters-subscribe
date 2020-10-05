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

  const getQuery = 'SELECT id, title from dialogs WHERE creator_id = $1';

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

  const { title } = req.body;

  if (!isValidNameLength(title)) {
    errorMessage.message = "inValidName";
    return res.status(status.bad).send(errorMessage);
  }

  const createQuery = 'INSERT INTO dialogs (title, creator_id) VALUES ($1, $2) RETURNING id';

  try {

    var { rows } = await dbQuery.query(createQuery, [title, req.user.id]);
    successMessage.data = {};
    successMessage.data.dialogId = rows[0].id;
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

  // if (!isValidNameLength(title)) {
  //   errorMessage.message = "inValidName";
  //   return res.status(status.bad).send(errorMessage);
  // }

  const getQuery = 'SELECT * from messages WHERE dialog_id = $1';

  try {

    var { rows } = await dbQuery.query(getQuery, [dialog_id]);

    // if () {
    //
    // }

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

  const types = ["text"];

  const { content, type, dialog_id } = req.body;

  // if (!isValidNameLength(title)) {
  //   errorMessage.message = "inValidName";
  //   return res.status(status.bad).send(errorMessage);
  // }

  if (!types.includes(type)) {
    errorMessage.message = "invalidType"
    return res.status(status.bad).send(errorMessage);
  }

  const createQuery = 'INSERT INTO messages (m_content, m_type, creator_id, dialog_id) VALUES ($1, $2, $3, $4) RETURNING *';

  try {
    var vals = [content, type, req.user.id, dialog_id];
    var { rows } = await dbQuery.query(createQuery, vals);
    successMessage.data = rows[0];
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
  createMessage
};
