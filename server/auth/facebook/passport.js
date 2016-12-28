import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';

export function setup(User, config) {
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
  },
  (token, refreshToken, profile, done) => {
    User.findOne({ facebookId: profile.id }).exec()
      .then((user) => {
        if (user) {
          return done(null, user);
        }

        const newUser = new User({
          name: profile.displayName,
          facebookId: profile.id,
          email: profile.emails,
          avatar: profile.photos[0].value,
        });
        newUser.save()
          .then(savedUser => done(null, savedUser))
          .catch(err => done(err));
      })
      .catch(err => done(err));
  }));
}
