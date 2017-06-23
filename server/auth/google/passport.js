import passport from 'passport';

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const manipulateUser = (User, profile, done, token) => {
  User.findOne({ googleId: profile.id }, (err, user) => {
    if (err) return done(err);
    if (user) {
      return done(null, user);
    }
    const newUser = new User();
    newUser.googleId = profile.id;
    newUser.name = profile.displayName;
    newUser.avatar = profile.photos[0].value;
    profile.emails.forEach((email) => { newUser.emails.push(email.value); });
    newUser.save((err) => {
      if (err) throw err;
      return done(null, newUser);
    });
  });
};

const strategy = (User, config) => new GoogleStrategy({
  clientID: config.googleAuth.clientID,
  clientSecret: config.googleAuth.clientSecret,
  callbackURL: config.googleAuth.callbackURL,
}, (token, refreshToken, profile, done) => {
  process.nextTick(() => manipulateUser(User, profile, done, token));
});

export const setup = (User, config) => {
  passport.use(strategy(User, config));
};
