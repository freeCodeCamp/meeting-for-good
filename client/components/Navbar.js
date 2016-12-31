import React from 'react';
import { Link } from 'react-router';
import cssModules from 'react-css-modules';
import styles from '../styles/navbar.css';
import '../styles/no-css-modules/mdl.css';
import facebookLogo from '../assets/facebook.png';
import googleLogo from '../assets/google.png';

class Navbar extends React.Component {
  renderNav() {
    if (this.props.user) {
      return (
        <div className="mdl-navigation">
          <Link className="mdl-navigation__link" to="/dashboard">Dashboard</Link>
          <a className="mdl-navigation__link" href="/api/auth/logout">Logout</a>
          <a className="mdl-navigation__link" href="#avatar">
            <img
              alt="avatar"
              styleName="nav-img"
              src={this.props.userAvatar}
            />
          </a>
        </div>
      );
    }

    return (
      <div className="mdl-navigation" styleName="login-btn">
        <a
          className="mdl-button mdl-js-button mdl-button--raised\
                     mdl-js-ripple-effect mdl-color--indigo"
          href="/api/auth/facebook"
          onClick={this.props.handleAuthClick}
        ><img src={facebookLogo} alt="Facebook Logo" /> Login with Facebook</a>
        <a
          className="mdl-button mdl-js-button mdl-button--raised\
                     mdl-js-ripple-effect mdl-color--red"
          href="/api/auth/google"
          onClick={this.props.handleAuthClick}
        ><img src={googleLogo} alt="Google Logo" /> Login with Google</a>
      </div>
    );
  }

  render() {
    return (
      <header className="mdl-layout__header">
        <div className="mdl-layout__header-row">
          <Link
            to={this.props.conditionalHomeLink}
            className="mdl-layout-title mdl-navigation__link"
          >Lets Meet</Link>
          <div className="mdl-layout-spacer" />
          {this.renderNav()}
        </div>
      </header>
    );
  }
}

Navbar.propTypes = {
  user: React.PropTypes.bool,
  userAvatar: React.PropTypes.string,
  handleAuthClick: React.PropTypes.func,
  conditionalHomeLink: React.PropTypes.string,
};

export default cssModules(Navbar, styles);
