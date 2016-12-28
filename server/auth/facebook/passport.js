import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';

export const setup = (User, config) => {
  passport.use(new FacebookStrategy({
    clientID: config.facebookAuth.clientID,
    clientSecret: config.facebookAuth.clientSecret,
    callbackURL: config.facebookAuth.callbackURL,
    profileFields: [
      'id',
      'displayName',
      'photos',
      'emails',
    ],
  }, (token, refreshToken, profile, done) => {
    process.nextTick(() => {
      User.findOne({ facebookId: profile.id }, (err, user) => {
        if (err) return done(err);
        if (user) return done(null, user);

        const newUser = new User();
        newUser.facebookId = profile.id;
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

