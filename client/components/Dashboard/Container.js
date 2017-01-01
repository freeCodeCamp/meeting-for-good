import React from 'react';
import { browserHistory } from 'react-router';
import fetch from 'isomorphic-fetch';
import autobind from 'autobind-decorator';
import nprogress from 'nprogress';
import Dashboard from './Presentation';
import { checkStatus, parseJSON } from '../../util/fetch.util';
import { isAuthenticated } from '../../util/auth';

export default class DashboardContainer extends React.Component {
  constructor() {
    super();
    this.state = {
      events: [],
      showNoScheduledMessage: false,
      notificationIsActive: false,
      notificationMessage: '',
    };
  }

  async componentWillMount() {
    if (sessionStorage.getItem('redirectTo')) {
      browserHistory.push(sessionStorage.getItem('redirectTo'));
      sessionStorage.removeItem('redirectTo');
    }

    if (!await isAuthenticated()) browserHistory.push('/');

    nprogress.configure({ showSpinner: false });
    nprogress.start();
    const response = await fetch('/api/events/getByUser', { credentials: 'same-origin' });
    let events;
    try {
      checkStatus(response);
      events = await parseJSON(response);
    } catch (err) {
      console.log(err);
      this.setState({
        notificationIsActive: true,
        notificationMessage: 'Failed to load events. Please try again later.',
      });
      return;
    } finally {
      nprogress.done();
      this.setState({ showNoScheduledMessage: true });
    }

    this.setState({ events });
  }

  @autobind
  removeEventFromDashboard(eventId) {
    this.setState({
      events: this.state.events.filter(event => event._id !== eventId),
    });
  }

  render() {
    const { showNoScheduledMessage, events } = this.state;
    const childProps = { showNoScheduledMessage, events };

    return (
      <Dashboard
        removeEventFromDashboard={this.removeEventFromDashboard}
        {...childProps}
      />
    );
  }
}

