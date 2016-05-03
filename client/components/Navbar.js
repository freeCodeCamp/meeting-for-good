import React from 'react';
import CSSModules from 'react-css-modules';

import styles from '../styles/navbar';

class Navbar extends React.Component {
  constructor() {
    super();
    this.state = {
      userAvatar: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png',
      user: false
    };
  }

  componentDidMount() {
    $.get('/api/auth/current', user => {
      if (user !== "") {
        let userAvatar;
        if(user.github) userAvatar = user.github.avatar;
        else if(user.facebook) userAvatar = user.facebook.avatar;
        this.setState({ userAvatar, user: true });
      }
    });
  }

  render() {
    let links;
    if(this.state.user){
      links = ['<a id="user" href="/api/auth/logout">Logout</a>', '<a id="user" href="/dashboard">Dashboard</a>'];
    } else {
      links = []
    }
    return (
      <nav className="grey darken-3">
        <div className="container">
          <a href="/" className="brand-logo">Lets Meet</a>
          <ul id="nav-mobile" className="right hide-on-med-and-down">
            <li>
              {links.forEach(el => {
                $("#nav-mobile li a").not("#user").remove()
                $("#nav-mobile li").prepend(el);
              })}
              <a href="/login">Login</a>
              <a href="/signup">Signup</a>
              <a href="#" id="user">
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
