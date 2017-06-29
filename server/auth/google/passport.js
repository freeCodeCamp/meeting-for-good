import passport from 'passport';
import refresh from 'passport-oauth2-refresh';

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const manipulateUser = async (User, profile, done, token, refreshToken) => {
  try {
    const user = await User.findOne({ googleId: profile.id });
    if (user) {
      user.accessToken = token;
      user.refreshToken = refreshToken;
      await user.save();
      return done(null, user);
    }
    const newUser = new User();
    newUser.googleId = profile.id;
    newUser.name = profile.displayName;
    newUser.avatar = profile.photos[0].value;
    newUser.accessToken = token;
    newUser.refreshToken = refreshToken;
    profile.emails.forEach((email) => { newUser.emails.push(email.value); });
    await newUser.save();
    return done(null, newUser);
  } catch (err) {
    console.log('err at manipulateUser passport', err);
    return done(err);
  }
};

const strategy = (User, config) => new GoogleStrategy({
  clientID: config.googleAuth.clientID,
  clientSecret: config.googleAuth.clientSecret,
  callbackURL: config.googleAuth.callbackURL,
}, async (token, refreshToken, profile, done) =>
    manipulateUser(User, profile, done, token, refreshToken));

export const setup = (User, config) => {
  passport.use(strategy(User, config));
  refresh.use(strategy(User, config));
};
