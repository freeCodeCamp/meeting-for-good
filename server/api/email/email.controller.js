/**
 * Using Rails-like standard naming convention for endpoints.
 * POST    /api/ownerNotification   ->  ownerNotification
 * POST   /api/sendInvite           ->  sendInvite
 */
import nodemailer from 'nodemailer';
import path from 'path';
import sesTransport from 'nodemailer-ses-transport';

const EmailTemplate = require('email-templates').EmailTemplate;

const respondWithResult = (res, statusCode) => {
  statusCode = statusCode || 200;
  return (entity) => {
    if (entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
};

const handleError = (res, statusCode) => {
  statusCode = statusCode || 500;
  return (err) => {
    console.log('handleError at email.controler', err);
    res.status(statusCode).send(err);
  };
};

const sendEmail = (message) => {
  const transporter = nodemailer.createTransport(sesTransport({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  }));
  return transporter.sendMail(message);
};

const ownerNotification = (req, res) => {
  const message = req.body;
  message.from = process.env.EMAIL_FROM;
  const templateDir = path.join(__dirname, 'templates', 'ownerNotification');
  const template = new EmailTemplate(templateDir);
  template.render(message, (err, result) => {
    if (err) {
      console.log('err at render of ownerNotification', err);
      return err;
    }
    message.subject = 'Meeting for Good Invite Accepeted';
    message.text = result.text;
    message.html = result.html;
    return sendEmail(message)
    .then(respondWithResult(res))
    .catch(handleError(res));
  });
};

const sendInvite = (req, res) => {
  const message = req.body;
  message.from = process.env.emailFrom;
  const templateDir = path.join(__dirname, 'templates', 'inviteGuests');
  const template = new EmailTemplate(templateDir);
  template.render(message, (err, result) => {
    if (err) {
      console.log('err at render of sendInvite', err);
      return err;
    }
    message.subject = `Meeting for Good Invite from ${message.eventOwnerName}`;
    message.text = result.text;
    message.html = result.html;
    return sendEmail(message)
      .then(respondWithResult(res))
      .catch(handleError(res));
  });
};

const ownerNotificationForEdit = (req, res) => {
  const message = req.body;
  message.from = process.env.emailFrom;
  const templateDir = path.join(__dirname, 'templates', 'editAvailability');
  const template = new EmailTemplate(templateDir);
  template.render(message, (err, result) => {
    if (err) {
      console.log('err at render of ownerNotificationForEdit', err);
      return err;
    }
    message.subject = 'Meeting for Good Availability Change';
    message.text = result.text;
    message.html = result.html;
    return sendEmail(message)
      .then(respondWithResult(res))
      .catch(handleError(res));
  });
};

export { ownerNotification, sendInvite, ownerNotificationForEdit };
