import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import { Notification } from 'react-notification';
import autobind from 'autobind-decorator';
import { browserHistory } from 'react-router';

import EventDetailsComponent from '../../components/EventDetailsComponent/EventDetailsComponent';
import styles from './event-details.css';
import GuestInviteDrawer from '../../components/GuestInviteDrawer/GuestInviteDrawer';

class EventDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      event: null,
      notificationMessage: '',
      notificationIsActive: false,
      showLoginModal: false,
      openDrawer: false,
      eventToInvite: {},
      curUser: {},
      isAuthenticated: false,
    };
  }

  async componentWillMount() {
    const { isAuthenticated, curUser } = this.props;
    if (isAuthenticated === true) {
      const event = await this.props.cbLoadEvent(this.props.params.uid);
      this.setState({ event, curUser });
    } else {
      this.props.cbOpenLoginModal(`/event/${this.props.params.uid}`);
    }
  }

  async componentWillReceiveProps(nextProps) {
    const { isAuthenticated, curUser } = nextProps;
    if (isAuthenticated === true) {
      const event = await this.props.cbLoadEvent(this.props.params.uid);
      this.setState({ event, curUser });
    }
  }

  @autobind
  handleInviteGuests(event) {
    this.setState({ openDrawer: true, eventToInvite: event });
  }

  @autobind
  handleCbGustInviteDrawer(open) {
    this.setState({ openDrawer: open });
  }

  @autobind
  async handleDeleteEvent(id) {
    const response = await this.props.cbDeleteEvent(id);
    if (response) {
      browserHistory.push('/dashboard');
    } else {
      this.setState({
        notificationIsActive: true,
        notificationMessage: 'Event Deleted fail, please try again latter.',
        notificationTitle: 'Error!',
      });
    }
  }

  render() {
    const { event, notificationIsActive, notificationMessage, notificationTitle, openDrawer, eventToInvite, curUser } = this.state;
    if (event) {
      return (
        <div styleName="event">
          <EventDetailsComponent event={event} showInviteGuests={this.handleInviteGuests} cbDeleteEvent={this.handleDeleteEvent} />
          <GuestInviteDrawer open={openDrawer} event={eventToInvite} curUser={curUser} cb={this.handleCbGustInviteDrawer} />
        </div>
      );
    }
    return (
      <Notification
        isActive={notificationIsActive}
        message={notificationMessage}
        action="Dismiss"
        title={notificationTitle}
        onDismiss={() => this.setState({ notificationIsActive: false })}
        onClick={() => this.setState({ notificationIsActive: false })}
        activeClassName="notification-bar-is-active"
        dismissAfter={6000}
      />
    );
  }
}

EventDetails.propTypes = {
  params: React.PropTypes.object,
  isAuthenticated: React.PropTypes.bool,
  cbOpenLoginModal: React.PropTypes.func,
  curUser: React.PropTypes.object,
  cbLoadEvent: React.PropTypes.func,
  cbDeleteEvent: React.PropTypes.func,
};

export default cssModules(EventDetails, styles);
