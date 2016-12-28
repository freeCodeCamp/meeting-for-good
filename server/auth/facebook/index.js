'use strict';

import express from 'express';
import passport from 'passport';

const router = express.Router();


router.get('/', passport.authenticate('facebook', {
  scope: ['email', 'user_about_me'],
  failureRedirect: '/',
}));

router.get('/callback', passport.authenticate('facebook', {
  successRedirect: '/dashboard',
  failureRedirect: '/',
}));

module.exports = router;
