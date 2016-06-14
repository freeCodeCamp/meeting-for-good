import React from 'react';
import { browserHistory } from 'react-router';

import { isAuthenticated } from '../util/auth';

class Home extends React.Component {
  async componentWillMount() {
    if (localStorage.getItem('redirectTo')) {
      browserHistory.push(localStorage.getItem('redirectTo'));
      localStorage.removeItem('redirectTo');
    }

    if (await isAuthenticated()) browserHistory.push('/dashboard');
  }

  render() {
    return <div />;
  }
}

export default Home;
