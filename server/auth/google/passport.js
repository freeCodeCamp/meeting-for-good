import passport from 'passport';

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

export const setup = (User, config) => {
  passport.use(new GoogleStrategy({
    clientID: config.googleAuth.clientID,
    clientSecret: config.googleAuth.clientSecret,
    callbackURL: config.googleAuth.callbackURL,
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
};
