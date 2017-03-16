'use strict';

import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get('/', passport.authenticate('facebook', {
  scope: ['email', 'public_profile'],
  failureRedirect: '/',
}));

router.get('/callback', passport.authenticate('facebook', {
  successRedirect: '/loginController',
  failureRedirect: '/loginController',
}));

module.exports = router;
