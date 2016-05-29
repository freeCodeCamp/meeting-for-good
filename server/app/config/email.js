import nodemailer from 'nodemailer';

export default (message, cb) => {
  const transporter = nodemailer.createTransport({
    service: 'Mailgun',
    auth: {
      user: process.env.mailgunLogin,
      pass: process.env.mailgunPassword,
    },
  });

  transporter.sendMail(message, (err, info) => {
    if (err) cb(err, info);
    else cb(undefined, info);
  });
};
