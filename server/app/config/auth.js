export default {
  githubAuth: {
    clientID: process.env.GITHUB_KEY,
    clientSecret: process.env.GITHUB_SECRET,
    callbackURL: `${process.env.APP_URL}api/auth/github/callback`,
  },
  facebookAuth: {
    clientID: process.env.FACEBOOK_KEY,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: `${process.env.APP_URL}api/auth/facebook/callback`,
  }
};
