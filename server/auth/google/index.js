'use strict';

import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get('/', passport.authenticate('google', {
  scope: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ],
  failureRedirect: '/',
}));

router.get('/callback', passport.authenticate('google', {
  successRedirect: '/loginController',
  failureRedirect: '/loginController',
}));

module.exports = router;
