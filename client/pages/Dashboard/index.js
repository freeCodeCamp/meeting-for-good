/* vendor dependencies */
import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import cssModules from 'react-css-modules';
import Masonry from 'react-masonry-component';
import autobind from 'autobind-decorator';
import { NotificationStack } from 'react-notification';
import { OrderedSet } from 'immutable';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import DateRangeIcon from 'material-ui/svg-icons/action/date-range';
/* external components */
import EventCard from '../../components/EventCard/EventCard';
import GuestInviteDrawer from '../../components/GuestInviteDrawer/GuestInviteDrawer';

/* styles */
import styles from './dashboard.css';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      notifications: OrderedSet(),
      count: 0,
      openDrawer: false,
      eventToInvite: {},
      curUser: {},
    };
  }

  async componentWillMount() {
    const { isAuthenticated, curUser, events } = this.props;
    if (isAuthenticated === false) {
      this.props.cbOpenLoginModal('/dashboard');
    } else {
      this.setState({ curUser, events });
    }
  }

  async componentWillReceiveProps(nextProps) {
    const { showPastEvents, isAuthenticated, curUser, events } = nextProps;
    if (isAuthenticated) {
      this.setState({ showPastEvents, events, curUser });
    }
  }

  removeNotification(key) {
    const { notifications } = this.state;
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
  handleNewEvent() {
    browserHistory.push('/event/new');
  }

  @autobind
  async handleDeleteEvent(id) {
    const response = this.props.cbDeleteEvent(id);
    if (response) {
      this.addNotification('Info', 'Event Deleted');
    } else {
      this.addNotification('Alert!!!', 'Event Deleted fail, please try again latter.');
    }
  }

  @autobind
  handleInviteGuests(event) {
    this.setState({ openDrawer: true, eventToInvite: event });
  }

  @autobind
  handleCbGuestInviteDrawer(open) {
    this.setState({ openDrawer: open });
  }

  render() {
    const { events, curUser, notifications, openDrawer, eventToInvite } = this.state;
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
                cbDeleteEvent={this.handleDeleteEvent}
                curUser={curUser}
                showInviteGuests={this.handleInviteGuests}
              />
            ))}
          </Masonry> :
          <div styleName="no-select-container">
            <h4 styleName="no-select">
              You have no current scheduled events.
            </h4>
            <DateRangeIcon styleName="no-selectIcon" />
          </div>
        }
        <NotificationStack
          notifications={notifications.toArray()}
          onDismiss={notification => this.setState({
            notifications: notifications.delete(notification),
          })}
        />
        <GuestInviteDrawer open={openDrawer} event={eventToInvite} curUser={curUser} cb={this.handleCbGuestInviteDrawer} />
      </div>
    );
  }
}

Dashboard.propTypes = {
  isAuthenticated: React.PropTypes.bool,
  cbOpenLoginModal: React.PropTypes.func,
  curUser: React.PropTypes.object,
  events: React.PropTypes.array,
  cbDeleteEvent: React.PropTypes.func,
};

export default cssModules(Dashboard, styles);

