import React from 'react';

export default class DefaultLayout extends React.Component {
  render() {
    return (
      <html>
        <head>
          <title>{this.props.title}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link href="http://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.6/css/materialize.min.css" />
          <link href="https://fonts.googleapis.com/css?family=Roboto:400,300,500" rel="stylesheet" type="text/css" />
          <link rel="stylesheet" type="text/css" href="/public/css/style.css" />
        </head>
        <body>
          <nav className="grey darken-3">
            <div className="container">
              <a href="/" className="brand-logo">Lets Meet</a>
              <ul id="nav-mobile" className="right hide-on-med-and-down">
                <li><a href="#"><img src="https://avatars1.githubusercontent.com/u/5279150?v=3&s=460" /></a></li>
              </ul>
            </div>
          </nav>
          <main>
            {this.props.children}
          </main>
          <script type="text/javascript" src="https://code.jquery.com/jquery-2.1.1.min.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.6/js/materialize.min.js"></script>
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
