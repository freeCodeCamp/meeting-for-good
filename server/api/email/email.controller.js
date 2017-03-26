/**
 * Using Rails-like standard naming convention for endpoints.
 * POST    /api/ownerNotification   ->  ownerNotification
 * POST   /api/sendInvite           ->  sendInvite
 */
import nodemailer from 'nodemailer';
import path from 'path';
import aws from 'aws-sdk';

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
    res.status(statusCode).send(err);
  };
};

const sendEmail = (message) => {
  const transporter = nodemailer.createTransport({
    service: 'SES',
    auth: {
      user: process.env.AWSAccessKeyID,
      pass: process.env.AWSSecretKey,
    },
  });
  return transporter.sendMail(message);
};

export const ownerNotification = (req, res) => {
  const message = req.body;
  message.from = process.env.emailFrom;
  const templateDir = path.join(__dirname, 'templates', 'ownerNotification');
  const template = new EmailTemplate(templateDir);
  template.render(message, (err, result) => {
    if (err) {
      console.log('err at render of ownerNotification', err);
      return err;
    }
    message.subject = 'Lets Meet Invite Accepeted';
    message.text = result.text;
    message.html = result.html;
    return sendEmail(message)
    .then(respondWithResult(res))
    .catch((err) => {
      console.log('err at ownerNotification', err);
      handleError(res);
    });
  });
};

export const sendInvite = (req, res) => {
  const message = req.body;
  message.from = process.env.emailFrom;
  const templateDir = path.join(__dirname, 'templates', 'inviteGuests');
  const template = new EmailTemplate(templateDir);
  template.render(message, (err, result) => {
    if (err) {
      console.log('err at render of sendInvite', err);
      return err;
    }
    message.subject = `Lets Meet Invite from ${message.eventOwnerName}`;
    message.text = result.text;
    message.html = result.html;
    return sendEmail(message)
      .then(respondWithResult(res))
      .catch((err) => {
        console.log('err at ownerNotification', err);
        handleError(err);
      });
  });
};
