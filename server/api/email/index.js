'use strict';

const express = require('express');
const controller = require('./email.controller');

const router = express.Router();

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(403).send('Authentiation required.');
};

// router.post('/ownerNotification', isAuthenticated, controller.ownerNotification);
router.post('/ownerNotification', controller.ownerNotification);


module.exports = router;
