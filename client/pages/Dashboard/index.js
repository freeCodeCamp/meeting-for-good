/* vendor dependencies */
import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import fetch from 'isomorphic-fetch';
import cssModules from 'react-css-modules';
import Masonry from 'react-masonry-component';
import autobind from 'autobind-decorator';
import nprogress from 'nprogress';
import { NotificationStack } from 'react-notification';
import { OrderedSet } from 'immutable';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import GuestInviteDrawer from '../../components/GuestInviteDrawer/GuestInviteDrawer';

/* external components */
import EventCard from '../../components/EventCard/EventCard';

/* styles */
import styles from './dashboard.css';

/* utilities */
import { checkStatus, parseJSON } from '../../util/fetch.util';
import { isAuthenticated, getCurrentUser } from '../../util/auth';

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
    if (sessionStorage.getItem('redirectTo')) {
      browserHistory.push(sessionStorage.getItem('redirectTo'));
      sessionStorage.removeItem('redirectTo');
    }

    if (!await isAuthenticated()) {
      browserHistory.push('/');
    }
    const user = await getCurrentUser();
    this.setState({ curUser: user });
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
  }

  removeNotification(key) {
    const { notifications } = this.state;
    this.setOwnerNotified(key);
    this.setState({
      notifications: notifications.filter(n => n.key !== key),
    });
  }

  addNotification(msgTitle, msg, participantId = 0, dismissTime = 3400) {
    const { notifications, count } = this.state;
    const newCount = count + 1;
    let msgKey = count + 1;
    // if was not a new event(no partipants yet)
    if (participantId !== 0) {
      msgKey = participantId;
    }
    return this.setState({
      count: newCount,
      notifications: notifications.add({
        message: msg,
        title: msgTitle,
        key: msgKey,
        action: 'Dismiss',
        dismissAfter: dismissTime,
        onClick: () => this.removeNotification(msgKey),
      }),
    });
  }

  @autobind
  removeEventFromDashboard(eventId) {
    const { events } = this.state;
    this.setState({
      events: events.filter(event => event._id !== eventId),
    });
  }

  @autobind
  handleNewEvent() {
    browserHistory.push('/event/new');
  }

  render() {
    const { events, curUser, notifications, showNoScheduledMessage } = this.state;
    return (
      <div styleName="wrapper">
        {/* New Event Icon */}
        <FloatingActionButton styleName="new-event-icon" secondary={true} onClick={this.handleNewEvent} >
          <ContentAdd />
        </FloatingActionButton>
        {/* Card Template */}
        {events.length !== 0 ?
          <Masonry>
            {events.map(event => (
              <EventCard
                key={event._id}
                event={event}
                removeEventFromDashboard={this.removeEventFromDashboard}
                user={curUser}
              />
            ))}
          </Masonry> :
            showNoScheduledMessage ?
              <em>
                <h4 styleName="no-select" className="card-title center-align black-text">
                  You have no scheduled events yet.
                </h4>
              </em> :
              null
        }
        <NotificationStack
          notifications={notifications.toArray()}
          onDismiss={notification => this.setState({
            notifications: notifications.delete(notification),
          })}
        />
      </div>
    );
  }
}

export default cssModules(Dashboard, styles);

