import React from 'react';
import CSSModules from 'react-css-modules';

import styles from '../styles/navbar';

class Navbar extends React.Component {
  constructor() {
    super();
    this.state = {
      userAvatar: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png',
    };
  }
  componentDidMount() {
    $.get('/api/auth/current', user => {
      if (user !== undefined) {
        let userAvatar = user.github ? user.github.avatar : user.facebook.avatar;
        this.setState({ userAvatar });
      }
    });
  }
  render() {
    return (
        <nav className="grey darken-4">
          <div className="container">
            <a href="/" className="brand-logo">Lets Meet</a>
            <ul id="nav-mobile" className="right hide-on-med-and-down">
              <li>
                <a href="#">
                  <img
                    styleName="nav-img"
                    src={this.state.userAvatar}
                  />
                </a>
              </li>
            </ul>
          </div>
        </nav>
    );
  }
}

export default CSSModules(Navbar, styles);
