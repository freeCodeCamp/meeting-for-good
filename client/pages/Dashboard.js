/* vendor dependencies */
import React from 'react';
import { browserHistory, Link } from 'react-router';
import fetch from 'isomorphic-fetch';
import cssModules from 'react-css-modules';
import Masonry from 'react-masonry-component';
import autobind from 'autobind-decorator';
import nprogress from 'nprogress';
import { Notification } from 'react-notification';

/* external components */
import EventCard from '../components/EventCard';

/* styles */
import styles from '../styles/dashboard.css';

/* utilities */
import { checkStatus, parseJSON } from '../util/fetch.util';
import { isAuthenticated } from '../util/auth';

class Dashboard extends React.Component {
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
    return (
      <div styleName="wrapper">
        {/* New Event Icon */}
        <div className="fixed-action-btn" styleName="new-event-icon">
          <Link to="/event/new" className="btn-floating btn-large red">
            <i className="large material-icons">add</i>
          </Link>
        </div>
        {/* Card Template */}
        {this.state.events.length !== 0 ?
          <Masonry>
            {this.state.events.map(event => (
              <EventCard
                key={event._id}
                event={event}
                removeEventFromDashboard={this.removeEventFromDashboard}
              />
            ))}
          </Masonry> :
            this.state.showNoScheduledMessage ?
              <em>
                <h4 styleName="no-select" className="card-title center-align white-text">
                  You have no scheduled events yet.
                </h4>
              </em> :
              null
        }
        <Notification
          isActive={this.state.notificationIsActive}
          message={this.state.notificationMessage}
          action="Dismiss"
          title="Error!"
          onDismiss={() => this.setState({ notificationIsActive: false })}
          onClick={() => this.setState({ notificationIsActive: false })}
          activeClassName="notification-bar-is-active"
          dismissAfter={10000}
        />
      </div>
    );
  }
}

export default cssModules(Dashboard, styles);
