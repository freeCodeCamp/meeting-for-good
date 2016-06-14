import React from 'react';
import cssModules from 'react-css-modules';
import { browserHistory } from 'react-router';

import { isAuthenticated } from '../util/auth';

import styles from '../styles/auth.css';

class Login extends React.Component {
  async componentWillMount() {
    if (await isAuthenticated()) browserHistory.push('/dashboard');
  }

  render() {
    return (
      <div className="card" styleName="card">
        <div className="card-content">
          <h4 className="center">Login</h4>
          <form action="/api/auth/local/login" method="post">
            <div className="input-field">
              <input placeholder="Username" name="username" type="text" className="validate" />
            </div>
            <div className="input-field">
              <input
                placeholder="Password"
                name="password"
                type="password"
                className="validate"
              />
            </div>
            <p className="center">
              <a className="waves-effect waves-light btn purple">
                <input type="submit" value="Login" />
              </a>
            </p>
          </form>
          <div className="center">
            <p>-or-</p>
            <p>
              <a href="/api/auth/github" className="waves-effect waves-light btn grey darken-2">
                Login with GitHub
              </a>
            </p>
            <p>
              <a
                href="/api/auth/facebook"
                className="waves-effect waves-light btn blue darken-4"
              >Login with Facebook</a>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default cssModules(Login, styles);
