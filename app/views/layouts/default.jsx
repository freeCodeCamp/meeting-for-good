import React from 'react';

export default class DefaultLayout extends React.Component {
  render() {
    return (
      <html>
        <head>
          <title>{this.props.title}</title>
          <link rel="stylesheet" type="text/css" href="/public/css/style.css" />
          <link href="https://fonts.googleapis.com/css?family=Roboto:400,300,500" rel="stylesheet" type="text/css" />
        </head>
        <body>{this.props.children}</body>
      </html>
    );
  }
}

DefaultLayout.propTypes = {
  title: React.PropTypes.string,
  children: React.PropTypes.element,
};
