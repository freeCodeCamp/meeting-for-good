import { AppContainer } from 'react-hot-loader'; // required
import React from 'react';
import ReactDOM from 'react-dom';
import Client from './client'; // App

const mountApp = document.getElementById('app');

ReactDOM.render(
  <AppContainer>
    <Client />
  </AppContainer>,
  mountApp,
);

if (module.hot) {
  module.hot.accept('./client', () => {
    ReactDOM.render(
      <AppContainer>
        <Client />
      </AppContainer>,
      mountApp,
    );
  });
}
