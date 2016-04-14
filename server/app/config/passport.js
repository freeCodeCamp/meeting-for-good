const GitHubStrategy = require('passport-github').Strategy;
const LocalStrategy = require("passport-local").Strategy;
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

  passport.use(new GitHubStrategy({
    clientID: configAuth.githubAuth.clientID,
    clientSecret: configAuth.githubAuth.clientSecret,
    callbackURL: configAuth.githubAuth.callbackURL,
  },
  (token, refreshToken, profile, done) => {
    process.nextTick(() => {
      User.findOne({ 'github.id': profile.id }, (err, user) => {
        if (err) {
          return done(err);
        }

        if (user) {
          return done(null, user);
        }

        const newUser = new User();

        newUser.github.id = profile.id;
        newUser.github.username = profile.username;
        newUser.github.avatar = profile._json.avatar_url;

        newUser.save(err => {
          if (err) {
            throw err;
          }

          return done(null, newUser);
        });
      });
    });
  }));

  passport.use(new LocalStrategy({
      passReqToCallback : true
    },
      (req, username, password, done) => {
        User.findOne({ username: username }, function (err, user) {
              if (err)
                  return done(err);
              if (!user)
                  return done(null, false);
              if (!user.validPassword(password))
                  return done(null, false);
              if(user)
                return done(null,user)

              const newUser = new User();

              newUser.local.username = user.username;
              newUser.local.password = profile.password;

              newUser.save(err => {
                if (err) {
                  throw err;
                }
      
                return done(null, newUser);
              });
        });
      }
    ));
};
