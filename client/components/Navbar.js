import React, { Component } from 'react';
import { Link } from 'react-router';
import cssModules from 'react-css-modules';
import autobind from 'autobind-decorator';
import fetch from 'isomorphic-fetch';
import { checkStatus, parseJSON } from '../util/fetch.util';
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
      notificationPending: false,
    };
  }

  async componentWillMount() {
    await this.loadUser();
  }

  async componentDidMount() {
    await this.loadNotifications();
  }

  @autobind
  handleAuthClick() {
    if (!sessionStorage.getItem('redirectTo')) {
      sessionStorage.setItem('redirectTo', this.props.location.pathname);
    }
  }

  async loadUser() {
    const response = await fetch('/api/auth/current', { credentials: 'same-origin' });
    let user;
    try {
      checkStatus(response);
      user = await parseJSON(response);
      return user;
    } catch (err) {
      console.log(err);
      return;
    } finally {
      const userAvatar = user.avatar;
      this.setState({ userAvatar, user: true, curUser: user._id, conditionalHomeLink: '/Dashboard' });
    }
  }

  async loadNotifications() {
    const response = await fetch('/api/events/getGuestNotifications', { credentials: 'same-origin' });
    let notices;
    try {
      checkStatus(response);
      notices = await parseJSON(response);
      return notices;
    } catch (err) {
      console.log(err);
      return;
    } finally {
      this.setState({ notifications: notices });
    }
  }

  @autobind  
  async handleDismiss(participantId) {
    const response =  await fetch(`/api/events/GuestNotificationDismiss/${participantId}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      method: 'PATCH',
    });
    try {
      checkStatus(response);
    } catch (err) {
      console.log('handleDismiss', err);
    } finally {
      await this.loadNotifications();
    }
  }

  renderNotifications() {
    const { notifications, curUser } = this.state;
    let notificationPending = false;
    if (notifications) {
      notifications.forEach((notice) => {
        notice.participants.forEach((participant) => {
          if (participant.userId !== curUser && participant.ownerNotified === false) {
            notificationPending = true;
          }
        });
      });
    }
    console.log(notificationPending);
    return (
      <div>
        <button
          style={(notificationPending) ? { color: 'red' } : { color: 'white' }}
          id="menu-notifications"
          className="mdl-button mdl-js-button mdl-button--icon"
        >
          <i className="material-icons">priority_high</i>
        </button>
        <ul className="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" htmlFor="menu-notifications">
          {notifications.map((event) => {
            const participants = event.participants;
            return participants.map((participant) => {
              if (participant.userId.toString() !== curUser) {
                return (
                  <li className="mdl-menu__item mdl-menu__item--full-bleed-divider" id={participant._id} key={participant._id} >
                    <span>
                      {participant.name} accept your invite for
                      <Link to={`/event/${event._id}`} > {event.name} </Link>
                    </span>
                    { participant.ownerNotified === false ?
                      <button
                        className="mdl-button"
                        onClick={() => this.handleDismiss(participant._id)}
                      >
                        Dismiss
                      </button>
                      :
                      null
                    }
                  </li>
                );
              }
            });
          })
          }
        </ul>
      </div>
    );
  }

  renderNav() {
    if (this.state.user) {
      return (
        <div className="mdl-navigation">
          {this.renderNotifications()}
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
