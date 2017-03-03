import { AppContainer } from 'react-hot-loader'; // required
import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { cyan500 } from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Client from './client'; // App

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

const mountApp = document.getElementById('app');

const muiTheme = getMuiTheme({
  palette: {
    textColor: cyan500,
  },
  appBar: {
    height: 50,
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
