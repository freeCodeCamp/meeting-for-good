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

/* external components */
import EventCard from '../../components/EventCard/EventCard';
import GuestInviteDrawer from '../../components/GuestInviteDrawer/GuestInviteDrawer';

/* styles */
import styles from './dashboard.css';

/* utilities */
import { checkStatus, parseJSON } from '../../util/fetch.util';
import { isAuthenticated, getCurrentUser } from '../../util/auth';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    const showPastEvents = props.showPastEvents;
    this.state = {
      events: [],
      notifications: OrderedSet(),
      count: 0,
      showPastEvents,
      openDrawer: false,
      eventToInvite: {},
      curUser: {},
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
    const curUser = await getCurrentUser();
    const events = await this.loadEvents(false);
    this.setState({ curUser, events });
  }

  async componentWillReceiveProps(nextProps) {
    const { showPastEvents } = nextProps;
    const events = await this.loadEvents(showPastEvents);

    this.setState({ showPastEvents, events });
  }

  async loadEvents(showPastEvents) {
    let urlToFetch = '/api/events/getByUser';
    nprogress.configure({ showSpinner: false });
    nprogress.start();
    if (!showPastEvents) {
      const date = new Date();
      urlToFetch = `/api/events/getByUser/${date.toISOString()}`;
    }
    const response = await fetch(urlToFetch, { credentials: 'same-origin' });
    let events;
    try {
      checkStatus(response);
      events = await parseJSON(response);
      return events;
    } catch (err) {
      console.log('loadEvents, at Dashboard', err);
      this.addNotification('Error!!', 'Failed to load events. Please try again later.');
      return;
    } finally {
      nprogress.done();
      if (events.length === 0) {
        this.setState({ showNoScheduledMessage: true });
      }
    }
  }

  removeNotification(key) {
    const { notifications } = this.state;
    this.setOwnerNotified(key);
    this.setState({
      notifications: notifications.filter(n => n.key !== key),
    });
  }

  addNotification(msgTitle, msg, participantId = 0, dismissTime = 6000) {
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
    this.addNotification('Info', ' Event Deleted ');
  }

  @autobind
  handleNewEvent() {
    browserHistory.push('/event/new');
  }

  @autobind
  handleInviteGuests(event) {
    this.setState({ openDrawer: true, eventToInvite: event });
  }

  @autobind
  handleCbGustInviteDrawer(open) {
    this.setState({ openDrawer: open });
  }

  render() {
    const { events, curUser, notifications, showNoScheduledMessage, openDrawer, eventToInvite } = this.state;
    const styles = {
      height: '80vh',
    };
    return (
      <div styleName="wrapper">
        {/* New Event Icon */}
        <FloatingActionButton styleName="new-event-icon" secondary onClick={this.handleNewEvent} >
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
                curUser={curUser}
                showInviteGuests={this.handleInviteGuests}
              />
            ))}
          </Masonry> :
            showNoScheduledMessage ?
              <div style={styles}>
                <h4 styleName="no-select" >
                  You have no scheduled events yet.
                </h4>
              </div> :
            null
        }
        <NotificationStack
          notifications={notifications.toArray()}
          onDismiss={notification => this.setState({
            notifications: notifications.delete(notification),
          })}
        />
        <GuestInviteDrawer open={openDrawer} event={eventToInvite} curUser={curUser} cb={this.handleCbGustInviteDrawer} />
      </div>
    );
  }
}

Dashboard.propTypes = {
  showPastEvents: React.PropTypes.bool,
};

export default cssModules(Dashboard, styles);

