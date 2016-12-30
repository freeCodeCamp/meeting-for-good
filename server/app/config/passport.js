import User from '../../api/user/user.model';
import configAuth from './auth';

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;


module.exports = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  passport.use(new GoogleStrategy({
    clientID: configAuth.googleAuth.clientID,
    clientSecret: configAuth.googleAuth.clientSecret,
    callbackURL: configAuth.googleAuth.callbackURL,
  }, (token, refreshToken, profile, done) => {
    process.nextTick(() => {
      User.findOne({ googleId: profile.id }, (err, user) => {
        if (err) return done(err);
        if (user) return done(null, user);

        const newUser = new User();
        newUser.googleId = profile.id;
        newUser.name = profile.displayName;
        newUser.avatar = profile.photos[0].value;
        const emailToAdd = [];
        profile.emails.forEach((email) => {
          emailToAdd.push(email.value);
        });
        newUser.emails = emailToAdd;

        newUser.save((err) => {
          if (err) throw err;

          return done(null, newUser);
        });
      });
    });
  }));

  passport.use(new FacebookStrategy({
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL,
    profileFields: ['id', 'displayName', 'photos', 'emails'],
  }, (token, refreshToken, profile, done) => {
    process.nextTick(() => {
      User.findOne({ facebookId: profile.id }, (err, user) => {
        if (err) return done(err);
        if (user) return done(null, user);

        const newUser = new User();

        newUser.facebookId = profile.id;
        newUser.name = profile.displayName;
        newUser.avatar = profile.photos[0].value;
        newUser.emails = profile.emails;

        newUser.save((err) => {
          if (err) throw err;

          return done(null, newUser);
        });
      });
    });
  }));
};
