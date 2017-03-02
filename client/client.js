import React, { Component } from 'react';
import { Router, Route, browserHistory, IndexRoute, Redirect } from 'react-router';
import 'dialog-polyfill/dialog-polyfill';
import 'dialog-polyfill/dialog-polyfill.css';
// Import App
import App from './components/App';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import EventDetails from './pages/EventDetails';
import NewEvent from './pages/NewEvent';

// Vendor Dependencies
import './styles/no-css-modules/nprogress.css';
import './styles/no-css-modules/react-notifications.css';

require('es6-promise').polyfill();

export default class Client extends Component {

  render() {
    return (
      <Router history={browserHistory}>
        <Route path="/" component={App}>
          <IndexRoute component={Home} />
          <Route path="dashboard" component={Dashboard} />
          <Route path="event">
            <Route path="new" component={NewEvent} />
            <Route path=":uid" component={EventDetails} />
          </Route>
        </Route>
        <Redirect from="*" to="/" />
      </Router>
    );
  }
}

/* import React, { Component } from 'react';
import { Router, browserHistory, Redirect } from 'react-router';
import 'dialog-polyfill/dialog-polyfill';
import 'dialog-polyfill/dialog-polyfill.css';
// Import App
import App from './components/App';
import Home from './pages/Home';

// Vendor Dependencies
import './styles/no-css-modules/nprogress.css';
import './styles/no-css-modules/react-notifications.css';

require('es6-promise').polyfill();

const componentRoutes = {
  component: App,
  path: '/',
  indexRoute: { component: Home },
  childRoutes: [
    {
      path: 'dashboard',
      getComponent(location, cb) {
        System.import('./pages/Dashboard')
          .then(module => cb(null, module.default));
      },
    },
    {
      path: 'event',
      childRoutes: [
        {
          path: 'new',
          getComponent(location, cb) {
            System.import('./pages/NewEvent')
              .then(module => cb(null, module.default));
          },
        },
        {
          path: ':uid',
          getComponent(location, cb) {
            System.import('./pages/EventDetails')
              .then(module => cb(null, module.default));
          },
        },
      ],
    },
  ],
};

export default class Client extends Component {
  render() {
    return (
      <Router history={browserHistory} routes={componentRoutes}>
        <Redirect from="*" to="/" />
      </Router>
    );
  }
}*/
