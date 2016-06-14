import React from 'react';
import { browserHistory } from 'react-router';

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
    return <div />;
  }
}

export default Home;
