import React from 'react';
import CSSModules from 'react-css-modules';

import styles from '../styles/login';

class Login extends React.Component {
  render() {
    return (
      <div className="card" styleName="card">
        <div className="card-content">
          <h4 className="center">Login</h4>
          <div className="input-field">
            <input placeholder="Username" id="username" type="text" className="validate" />
          </div>
          <div className="input-field">
            <input placeholder="Password" id="password" type="password" className="validate" />
          </div>
          <div className="center">
            <p><a className="waves-effect waves-light btn purple">Login</a></p>
            <p>-or-</p>
            <p>
              <a className="waves-effect waves-light btn grey darken-2">Login with GitHub</a>
            </p>
            <p>
              <a className="waves-effect waves-light btn blue darken-4">Login with Facebook</a>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default CSSModules(Login, styles);
