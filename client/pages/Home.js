import React from 'react';
import { browserHistory } from 'react-router';
import cssModules from 'react-css-modules';
import styles from '../styles/home.css';

import { isAuthenticated } from '../util/auth';

class Home extends React.Component {
  async componentWillMount() {
    if (sessionStorage.getItem('redirectTo')) {
      browserHistory.push(sessionStorage.getItem('redirectTo'));
      sessionStorage.removeItem('redirectTo');
    }

    if (await isAuthenticated()) browserHistory.push('/dashboard');
  }

  render() {
    return (
      <div>
        <header styleName="header">
          <h2>LetsMeet</h2>
          <hr />
          <h6>The best meeting coordination app</h6>
          <img src="https://raw.githubusercontent.com/AkiraLaine/LetsMeet/development/client/assets/dashboard-banner.jpg" alt="dashboard" />
        </header>
        <main>
          <h2>Easy event creation</h2>
          <h6>Creating an event is easy as saying 1, 2, 3.</h6>
        </main>
      </div>
    );
  }
}

export default cssModules(Home, styles);
