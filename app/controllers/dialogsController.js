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

  const getQuery = 'SELECT id, title from dialogs';

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

    var values = [title, req.user.id];
    var { rows } = await dbQuery.query(createQuery, values);
    successMessage.data.dialogId = rows[0].id
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    return res.status(status.bad).send(errorMessage);
  }
};





export {
  getDialogs,
  createDialog
};
