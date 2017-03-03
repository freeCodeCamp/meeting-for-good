import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import cssModules from 'react-css-modules';

import styles from './login.css';

class LoginModal extends Component {

  componentDidMount() {
    document.querySelector('#loginModal').showModal();
  }

  @autobind
  async handleAuthClick(path) {
    document.querySelector('#loginModal').close();
    if (!sessionStorage.getItem('redirectTo')) {
      sessionStorage.setItem('redirectTo', window.location.pathname);
    }
  }

  render() {
    return (
      <dialog
        id="loginModal"
        onClick={ev => ev.stopPropagation()}
        className="mdl-dialog"
        styleName="mdl-dialog"
      >
        <h4 className="mdl-dialog__title">Please login</h4>
        <div className="mdl-dialog__content">
          <a
            className="mdl-button login-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-color--indigo"
            styleName="login-button"
            href="/api/auth/facebook"
            onClick={this.handleAuthClick}
          >
            <img src={require('../../assets/facebook.png')} alt="Facebook Logo" />
              Facebook
          </a>
          <a
            className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-color--red"
            href="/api/auth/google"
            styleName="login-button"
            onClick={this.handleAuthClick}
          >
            <img src={require('../../assets/google.png')} alt="Google Logo" />
              Google
          </a>
        </div>
        <div className="mdl_dialog__actions">
          <button
            type="button"
            className="mdl-button close"
            onClick={() => document.querySelector('#loginModal').close()}
          >Cancel</button>
        </div>
      </dialog>
    );
  }
}

export default cssModules(LoginModal, styles);

LoginModal.propTypes = {
  location: React.PropTypes.object,
}
