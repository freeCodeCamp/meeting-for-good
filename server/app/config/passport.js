const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
import User from '../models/users';
import configAuth from './auth';

module.exports = passport => {
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

        newUser.save(err => {
          if (err) throw err;

          return done(null, newUser);
        });
      });
    });
  }));
};
