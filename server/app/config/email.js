import nodemailer from 'nodemailer';

export default (message, cb) => {
  console.log('email', message);
  const transporter = nodemailer.createTransport({
    service: 'Mailgun',
    auth: {
      user: process.env.mailgunLogin,
      pass: process.env.mailgunPassword,
    },
  });
  console.log(process.env.mailgunLogin);
  transporter.sendMail(message, (err, info) => {
    if (err) cb(err, info);
    else cb(undefined, info);
  });
};
