'use strict';

const express = require('express');
const controller = require('./user.controller');

const router = express.Router();

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(403).send('Authentiation required.');
};

router.get('/', isAuthenticated, controller.index);
router.get('/byName/:name', isAuthenticated, controller.indexByName);
router.get('/relatedUsers', isAuthenticated, controller.relatedUsers);
router.get('/me', isAuthenticated, controller.me);
router.get('/:id', isAuthenticated, controller.show);
router.put('/:id', isAuthenticated, controller.upsert);
router.post('/', isAuthenticated, controller.create);
router.delete('/:id', isAuthenticated, controller.destroy);

module.exports = router;
