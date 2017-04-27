import React from 'react';
import { Router, browserHistory, Redirect } from 'react-router';
// Import App
import App from './components/App';
import Home from './pages/home/';

require('es6-promise').polyfill();

const componentRoutes = {
  component: App,
  path: '/',
  indexRoute: { component: Home },
  childRoutes: [
    {
      path: 'loginController',
      getComponent(location, cb) {
        System.import('./components/Login/loginController')
          .then(module => cb(null, module.default));
      },
    }, {
      path: 'dashboard',
      getComponent(location, cb) {
        System.import('./pages/Dashboard')
          .then(module => cb(null, module.default));
      },
    }, {
      path: 'event',
      childRoutes: [
        {
          path: 'new',
          getComponent(location, cb) {
            System.import('./pages/NewEvent/')
              .then(module => cb(null, module.default));
          },
        }, {
          path: ':uid',
          getComponent(location, cb) {
            System.import('./pages/EventDetails/EventDetails')
              .then(module => cb(null, module.default));
          },
        },
      ],
    },
  ],
};

const Routes = () => {
  return (
    <Router history={browserHistory} routes={componentRoutes}>
      <Redirect from="*" to="/" />
    </Router>
  );
};

export default Routes;
