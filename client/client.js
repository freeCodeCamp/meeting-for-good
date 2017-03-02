import React, { Component } from 'react';
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

const loadRoute = (cb) => {
  return module => cb(null, module.default);
};

const errorLoading = (err) => {
  console.error('Dynamic page loading failed', err);
};


const componentRoutes = {
  component: App,
  path: '/',
  indexRoute: { component: Home },
  childRoutes: [
    {
      path: 'dashboard',
      getComponent(location, cb) {
        System.import('./pages/Dashboard')
         .then(loadRoute(cb)).catch(errorLoading);
      },
    },
    {
      path: 'event',
      childRoutes: [
        {
          path: 'new',
          getComponent(location, cb) {
            System.import('./pages/NewEvent')
               .then(loadRoute(cb)).catch(errorLoading);
          },
        },
        {
          path: ':uid',
          getComponent(location, cb) {
            System.import('./pages/EventDetails')
               .then(loadRoute(cb)).catch(errorLoading);
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
}
