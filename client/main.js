import { AppContainer } from 'react-hot-loader'; // required
import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import * as OfflinePluginRuntime from 'offline-plugin/runtime';
import Routes from './router'; // App
import { darkBlack } from '../node_modules/material-ui/styles/colors';

// Vendor Dependencies
import './styles/no-css-modules/nprogress.css';
import './styles/no-css-modules/react-notifications.css';

OfflinePluginRuntime.install();

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

const mountApp = document.getElementById('app');

const muiTheme = getMuiTheme({
  fontFamily: 'Lato, Roboto, sans-serif',
  fontWeight: 300,
  palette: { textColor: darkBlack, disabledColor: '#A7A7A7', primary1Color: '#006400', accent1Color: '#FF4025' },
  snackbar: { textColor: 'black', backgroundColor: 'white' },
  raisedButton: { fontWeight: 'regular' },
  flatButton: { fontWeight: 'bold' },
});

ReactDOM.render(
  <AppContainer>
    <MuiThemeProvider muiTheme={muiTheme}>
      <Routes />
    </MuiThemeProvider>
  </AppContainer>,
  mountApp,
);

if (module.hot) {
  module.hot.accept('./router', () => {
    ReactDOM.render(

      <AppContainer>
        <MuiThemeProvider muiTheme={muiTheme}>
          <Routes />
        </MuiThemeProvider>
      </AppContainer>,
      mountApp,
    );
  });
}
