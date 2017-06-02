import React from 'react';
import { Router, browserHistory } from 'react-router';
import ReactGA from 'react-ga';
// Import App
import App from './components/App';
import Home from './pages/home/';

require('es6-promise').polyfill();

// google analytics loader
ReactGA.initialize(process.env.GoogleAnalyticsID, {
  debug: process.env.GoogleAnalyticsDebug === 'true',
  titleCase: false,
});

const logPageView = () => {
  ReactGA.set({ page: window.location.pathname + window.location.search });
  ReactGA.pageview(window.location.pathname + window.location.search);
};


const loadRoute = cb => module => cb(null, module.default);

const errorLoading = (err) => {
  console.error('Dynamic page loading failed', err);
};

const componentRoutes = {
  component: App,
  path: '/',
  indexRoute: { component: Home },
  childRoutes: [
    {
      path: 'loginController',
      getComponent(location, cb) {
        System.import('./components/Login/loginController')
          .then(loadRoute(cb)).catch(errorLoading);
      },
    }, {
      path: 'dashboard',
      getComponent(location, cb) {
        System.import('./pages/Dashboard')
          .then(loadRoute(cb)).catch(errorLoading);
      },
    }, {
      path: 'event',
      childRoutes: [
        {
          path: 'new',
          getComponent(location, cb) {
            System.import('./pages/NewEvent/')
              .then(loadRoute(cb)).catch(errorLoading);
          },
        }, {
          path: ':uid',
          getComponent(location, cb) {
            System.import('./pages/EventDetails/EventDetails')
              .then(loadRoute(cb)).catch(errorLoading);
          },
        },
      ],
    }, {
      path: '*',
      onEnter: (nextState, replace) => replace('/'),
    },
  ],
};

const Routes = () => (
  <Router history={browserHistory} routes={componentRoutes} onUpdate={logPageView} />
);

export default Routes;
