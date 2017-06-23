/**
 * Using Rails-like standard naming convention for endpoints.
 * POST    /api/ownerNotification   ->  ownerNotification
 * POST   /api/sendInvite           ->  sendInvite
 */
import nodemailer from 'nodemailer';
import path from 'path';
import sesTransport from 'nodemailer-ses-transport';
import { respondWithResult, handleError } from '../utils/api.utils';

const EmailTemplate = require('email-templates').EmailTemplate;

const sendEmail = (message) => {
  const transporter = nodemailer.createTransport(sesTransport({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  }));
  return transporter.sendMail(message);
};

const emailTemplateSender = (template, message, res) => {
  const templateDir = path.join(__dirname, 'templates', template);
  const emailTemplate = new EmailTemplate(templateDir);
  message.from = process.env.EMAIL_FROM;
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
