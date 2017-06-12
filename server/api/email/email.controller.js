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
    accessKeyId: process.env.AWSAccessKeyID,
    secretAccessKey: process.env.AWSSecretKey,
  }));
  return transporter.sendMail(message);
};

const emailTemplateSender = (template, message, res) => {
  const templateDir = path.join(__dirname, 'templates', template);
  const emailTemplate = new EmailTemplate(templateDir);
  message.from = process.env.emailFrom;
  emailTemplate.render(message, (err, result) => {
    if (err) {
      console.log(`err at emailSender for template ${template}`, err);
      return err;
    }
    message.text = result.text;
    message.html = result.html;
    return sendEmail(message)
      .then(respondWithResult(res))
      .catch(handleError(res));
  });
};

const ownerNotification = (req, res) => {
  const message = req.body;
  message.subject = 'Meeting for Good Invite accepted';
  emailTemplateSender('ownerNotification', message, res);
};

const sendInvite = (req, res) => {
  const message = req.body;
  message.subject = `Meeting for Good Invite from ${message.eventOwnerName}`;
  emailTemplateSender('inviteGuests', message, res);
};

const ownerNotificationForEdit = (req, res) => {
  const message = req.body;
  message.subject = 'Meeting for Good Availability Change';
  emailTemplateSender('editAvailability', message, res);
};

export { ownerNotification, sendInvite, ownerNotificationForEdit };
