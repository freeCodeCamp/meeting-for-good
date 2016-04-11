import React from 'react';

import AppBar from 'material-ui/lib/app-bar';
import Avatar from 'material-ui/lib/avatar';
import getMuiTheme from 'material-ui/lib/styles/getMuiTheme';
import MyRawTheme from '../../config/theme.js';

export default class DefaultLayout extends React.Component {
  getChildContext() {
    return {
      muiTheme: getMuiTheme(MyRawTheme),
    };
  }

  render() {
    return (
      <html>
        <head>
          <title>{this.props.title}</title>

          <link rel="stylesheet" type="text/css" href="/public/css/style.css" />
          <link href="https://fonts.googleapis.com/css?family=Roboto:400,300,500" rel="stylesheet" type="text/css" />

          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body>
          <AppBar
            showMenuIconButton = {false}
            title = "Lets Meet"
            iconElementRight = {<Avatar src="https://avatars1.githubusercontent.com/u/5279150?v=3&s=460" />}
          />
          <main className="flex">
            {this.props.children}
          </main>
        </body>
      </html>
    );
  }
}

DefaultLayout.propTypes = {
  title: React.PropTypes.string,
  children: React.PropTypes.element,
};

DefaultLayout.childContextTypes = {
  muiTheme: React.PropTypes.object,
};
