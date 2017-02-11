/**
 * Using Rails-like standard naming convention for endpoints.
 * POST    /api/ownerNotification  ->  ownerNotification
 */
import nodemailer from 'nodemailer';

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
    service: 'Mailgun',
    auth: {
      user: process.env.mailgunLogin,
      pass: process.env.mailgunPassword,
    },
  });
  return transporter.sendMail(message);
};

export const ownerNotification = (req, res) => {
  const message = req.body;
  return sendEmail(message)
    .then(respondWithResult(res))
    .catch((err) => {
      console.log('err no ownerNotification', err);
      handleError(res);
    });
};
