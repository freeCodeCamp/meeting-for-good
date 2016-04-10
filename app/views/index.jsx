import React from 'react';

import AppBar from 'material-ui/lib/app-bar';
import Avatar from 'material-ui/lib/avatar';

import ThemeManager from 'material-ui/lib/styles/theme-manager';
import MyRawTheme from '../config/theme.js';

import DefaultLayout from './layouts/default';

export default class Main extends React.Component {
  getChildContext() {
    return {
      muiTheme: ThemeManager.getMuiTheme(MyRawTheme),
    };
  }

  render() {
    return (
      <DefaultLayout title="Lets Meet">
        <AppBar
          showMenuIconButton = {false}
          title = "Lets Meet"
          iconElementRight = {<Avatar src="https://avatars1.githubusercontent.com/u/5279150?v=3&s=460" />}
        />
      </DefaultLayout>
    );
  }
}

Main.childContextTypes = {
  muiTheme: React.PropTypes.object,
};
