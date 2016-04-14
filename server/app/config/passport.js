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

  passport.use(new LocalStrategy((username, password, done) => {
    process.nextTick(() => {
      User.findOne({'local.username': username}, (err, user) => {
           if (err) {
             return done(err);
           }

           if (user && user.local.password === password) {
             return done(null, user);
           }

           const newUser = new User();

           newUser.local.username = username;
           newUser.local.password = password;

           newUser.save(err => {
             if (err) {
               throw err;
             }

             return done(null, newUser);
           });
         });
      });
    }));
};
