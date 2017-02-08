/* vendor dependencies */
import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import fetch from 'isomorphic-fetch';
import cssModules from 'react-css-modules';
import Masonry from 'react-masonry-component';
import autobind from 'autobind-decorator';
import nprogress from 'nprogress';
import { NotificationStack } from 'react-notification';
import { OrderedSet } from 'immutable';

/* external components */
import EventCard from '../components/EventCard';

/* styles */
import styles from '../styles/dashboard.css';

/* utilities */
import { checkStatus, parseJSON } from '../util/fetch.util';
import { isAuthenticated } from '../util/auth';

class Dashboard extends Component {
  constructor() {
    super();
    this.state = {
      events: [],
      notifications: OrderedSet(),
      count: 0,
    };
  }

  async componentWillMount() {
    const { notifications, count } = this.state;

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
      this.addNotification('Error!!', 'Failed to load events. Please try again later.');
      return;
    } finally {
      nprogress.done();
      this.setState({ showNoScheduledMessage: true });
    }

    this.setState({ events });
    this.loadEventsNotifications();
  }


  removeNotification(count) {
    const { notifications } = this.state;
    this.setState({
      notifications: notifications.filter(n => n.key !== count),
    });
  }

  addNotification(msgTitle, msg) {
    const { notifications, count } = this.state;
    const newCount = count + 1;
    return this.setState({
      count: newCount,
      notifications: notifications.add({
        message: msg,
        title: msgTitle,
        key: newCount,
        action: 'Dismiss',
        dismissAfter: 3400,
        onClick: () => this.removeNotification(newCount),
      }),
    });
  }

  @autobind
  removeEventFromDashboard(eventId) {
    this.setState({
      events: this.state.events.filter(event => event._id !== eventId),
    });
  }
  @autobind
  loadEventsNotifications() {
    const { notifications, count } = this.state;
    console.log(count);
    let newCount = count;
    this.state.events.forEach((event) => {
      event.participants.forEach(
        (participant) => {
          if (participant.ownerNotified === false && participant.userId !== event.owner) {
            newCount = count + 1;
            console.log('new notification', newCount, event.name);
            this.addNotification('Info', `${participant.name} accept your invite for ${event.name}.`);
          }
        });
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
                <h4 styleName="no-select" className="card-title center-align black-text">
                  You have no scheduled events yet.
                </h4>
              </em> :
              null
        }
        <NotificationStack
          notifications={this.state.notifications.toArray()}
          onDismiss={notification => this.setState({
            notifications: this.state.notifications.delete(notification),
          })}
        />
      </div>
    );
  }
}

export default cssModules(Dashboard, styles);

