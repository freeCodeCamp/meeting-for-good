import React from 'react';
import CSSModules from 'react-css-modules';

import styles from '../styles/navbar';

const Navbar = () => (
  <nav className="grey darken-4">
    <div className="container">
      <a href="/" className="brand-logo">Lets Meet</a>
      <ul id="nav-mobile" className="right hide-on-med-and-down">
        <li>
          <a href="#">
            <img
              styleName="nav-img"
              src="https://avatars1.githubusercontent.com/u/5279150?v=3&s=460"
            />
          </a>
        </li>
      </ul>
    </div>
  </nav>
);

export default CSSModules(Navbar, styles);
