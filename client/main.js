import { AppContainer } from 'react-hot-loader'; // required
import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import * as OfflinePluginRuntime from 'offline-plugin/runtime';
import Client from './client'; // App
import { darkBlack, darkWhite } from '../node_modules/material-ui/styles/colors';

OfflinePluginRuntime.install();

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

const mountApp = document.getElementById('app');

const muiTheme = getMuiTheme({
  fontFamily: 'Lato, Roboto, sans-serif',
  fontWeight: 300,
  palette: {
    textColor: darkBlack,
    disabledColor: '#A7A7A7',
    primary1Color: '#006400',
    accent1Color: '#FF4025',
  },
  snackbar: {
    textColor: darkWhite,
    backgroundColor: '#006400',
  },
  raisedButton: {
    fontWeight: 'regular',
  },
  flatButton: {
    fontWeight: 'bold',
  },
});

ReactDOM.render(
  <AppContainer>
    <MuiThemeProvider muiTheme={muiTheme}>
      <Client />
    </MuiThemeProvider>
  </AppContainer>,
  mountApp,
);

if (module.hot) {
  module.hot.accept('./client', () => {
    ReactDOM.render(

      <AppContainer>
        <MuiThemeProvider muiTheme={muiTheme}>
          <Client />
        </MuiThemeProvider>
      </AppContainer>,
      mountApp,
    );
  });
}
