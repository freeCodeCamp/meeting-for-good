export default {
  googleAuth: {
    clientID: process.env.GOOGLE_KEY,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: `${process.env.APP_URL}api/auth/google/callback`,
  },
  facebookAuth: {
    clientID: process.env.FACEBOOK_KEY,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: `${process.env.APP_URL}api/auth/facebook/callback`,
  },
};
