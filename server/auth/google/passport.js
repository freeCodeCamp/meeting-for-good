import passport from 'passport';

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const manipulateUser = async (User, profile, done, token) => {
  try {
    const user = await User.findOne({ googleId: profile.id });
    if (user) {
      user.accessToken = token;
      await user.save();
      return done(null, user);
    }
    const newUser = new User();
    newUser.googleId = profile.id;
    newUser.name = profile.displayName;
    newUser.avatar = profile.photos[0].value;
    newUser.accessToken = token;
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
}, (token, refreshToken, profile, done) => {
  process.nextTick(() => manipulateUser(User, profile, done, token));
});

export const setup = (User, config) => {
  passport.use(strategy(User, config));
};
