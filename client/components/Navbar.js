import React from 'react';
import { Link } from 'react-router';
import cssModules from 'react-css-modules';
import styles from '../styles/navbar.css';

import { getCurrentUser } from '../util/auth';

class Navbar extends React.Component {
  constructor() {
    super();
    this.state = {
      userAvatar: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png',
      user: false,
    };
  }

  async componentWillMount() {
    const user = await getCurrentUser();
    if (user) {
      let userAvatar = this.state.userAvatar;

      if (user.github) userAvatar = user.github.avatar;
      else if (user.facebook) userAvatar = user.facebook.avatar;

      this.setState({ userAvatar, user: true });
    }
  }

  render() {
    return (
      <nav className="grey darken-3">
        <div className="container">
          <Link to="/" className="brand-logo">Lets Meet</Link>
          <ul id="nav-mobile" className="right hide-on-med-and-down">
            {this.state.user ?
              <li>
                <a href="/api/auth/logout">Logout</a>
                <Link to="/dashboard">Dashboard</Link>
                <a href="#">
                  <img
                    alt="avatar"
                    styleName="nav-img"
                    src={this.state.userAvatar}
                  />
                </a>
              </li> :
              <li>
                <Link to="/login">Login</Link>
                <Link to="/signup">Signup</Link>
              </li>
            }
          </ul>
        </div>
      </nav>
    );
  }
}

export default cssModules(Navbar, styles);
