import React, { Component } from 'react';
import { Link } from 'react-router';
import cssModules from 'react-css-modules';
import autobind from 'autobind-decorator';
import styles from '../styles/navbar.css';
import '../styles/no-css-modules/mdl.css';

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userAvatar: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png',
      user: false,
      conditionalHomeLink: '/',
      notifications: [],
      isMenuOpen: false,
      isOPen: false,
    };
  }

  componentWillMount() {
    $.get('/api/auth/current', (user) => {
      if (user) {
        const userAvatar = user.avatar;
        $.get('/api/events/getGuestNotifications', (notices) => {
          if (notices) {
            // this.setState({ notifications: notices });
            this.setState({ userAvatar, user: true, curUser: user._id, conditionalHomeLink: '/Dashboard', notifications: notices });
          } else {
            this.setState({ userAvatar, user: true, curUser: user._id, conditionalHomeLink: '/Dashboard' });
          }
        });
      }
    });
  }

  @autobind
  handleAuthClick() {
    if (!sessionStorage.getItem('redirectTo')) {
      sessionStorage.setItem('redirectTo', this.props.location.pathname);
    }
  }


  renderNav() {
    if (this.state.user) {
      return (
        <div className="mdl-navigation">
          <button id="menu-speed" className="mdl-button mdl-js-button mdl-button--icon">
            <i className="material-icons">more_vert</i>
          </button>
          <ul className="mdl-menu mdl-js-menu mdl-js-ripple-effect" htmlFor="menu-speed">
            {this.state.notifications.map((event) => {
              const participants = event.participants;
              return participants.map((participant) => {
                if (participant.userId.toString() !== this.state.curUser.toString()) {
                // console.log(participant.name, event.name);
                  return <li className="mdl-menu__item" key={participant._id} > {participant.name} accept ypur invite for {event.name} </li>;
                }
              });
            })
            }
          </ul>
          <Link className="mdl-navigation__link" to="/dashboard">Dashboard</Link>
          <a className="mdl-navigation__link" href="/api/auth/logout">Logout</a>
          <a className="mdl-navigation__link" href="#">
            <img
              alt="avatar"
              styleName="nav-img"
              src={this.state.userAvatar}
            />
          </a>
        </div>
      );
    }

    return (
      <div className="mdl-navigation" styleName="login-btn">
        <a
          className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-color--indigo"
          href="/api/auth/facebook"
          onClick={this.handleAuthClick}
        ><img src={require('../assets/facebook.png')} alt="Facebook Logo" /> Login with Facebook</a>
        <a
          className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-color--red"
          href="/api/auth/google"
          onClick={this.handleAuthClick}
        ><img src={require('../assets/google.png')} alt="Google Logo" /> Login with Google</a>
      </div>
    );
  }

  render() {
    return (
      <header className="mdl-layout__header">
        <div className="mdl-layout__header-row">
          <Link to={this.state.conditionalHomeLink} className="mdl-layout-title mdl-navigation__link">Lets Meet</Link>
          <div className="mdl-layout-spacer" />
          {this.renderNav()}
        </div>
      </header>
    );
  }
}

Navbar.propTypes = {
  location: React.PropTypes.object,
};

export default cssModules(Navbar, styles);
