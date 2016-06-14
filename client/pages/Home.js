import React from 'react';

import { browserHistory } from 'react-router';

class Home extends React.Component {
  componentWillMount() {
    if (localStorage.getItem('redirectTo')) {
      browserHistory.push(localStorage.getItem('redirectTo'));
      localStorage.removeItem('redirectTo');
    }
  }

  render() {
    return <div />;
  }
}

export default Home;
