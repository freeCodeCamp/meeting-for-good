import { AppContainer } from 'react-hot-loader'; // required
import React from 'react';
import ReactDOM from 'react-dom';
import Client from './client'; // App

const mountApp = document.getElementById('app');

ReactDOM.render(
  <AppContainer component={Client} />,
  mountApp,
);

if (module.hot) {
  module.hot.accept('./client', () => {
    ReactDOM.render(
      <AppContainer component={require('./client').default} />,
      mountApp,
    );
  });
}
