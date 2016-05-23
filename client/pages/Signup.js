import React from 'react';
import CSSModules from 'react-css-modules';

import styles from '../styles/auth';

class Signup extends React.Component {
  componentDidMount(){
    $.get('/api/auth/current', user => {
      if (user !== "") window.location.href = '/dashboard';
    });
  }
  render() {
    return (
      <div className="card" styleName="card">
        <div className="card-content">
          <h4 className="center">Signup</h4>
          <form action="/api/auth/local/signup" method="post">
            <div className="input-field">
              <input placeholder="Username" name="username" type="text" className="validate" />
            </div>
            <div className="input-field">
              <input placeholder="Password" name="password" type="password" className="validate" />
            </div>
            <p className="center">
              <a className="waves-effect waves-light btn purple">
                <input type="submit" value="Sign Up" />
              </a>
            </p>
          </form>
          <div className="center">
            <p>-or-</p>
            <p>
            <a href="/api/auth/github" className="waves-effect waves-light btn grey darken-2">
              Signup with GitHub
            </a>
            </p>
            <p>
              <a
                href="/api/auth/facebook"
                className="waves-effect waves-light btn blue darken-4"
              >Signup with Facebook</a>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default CSSModules(Signup, styles);
