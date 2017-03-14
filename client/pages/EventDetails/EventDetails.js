import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import fetch from 'isomorphic-fetch';
import { Notification } from 'react-notification';
import autobind from 'autobind-decorator';

import EventDetailsComponent from '../../components/EventDetailsComponent/EventDetailsComponent';
import { checkStatus, parseJSON } from '../../util/fetch.util';
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
      const event = await this.loadEvent();
      this.setState({ event, curUser });
    } else {
      this.props.cbOpenLoginModal(`/event/${this.props.params.uid}`);
    }
  }

  async componentWillReceiveProps(nextProps) {
    const { isAuthenticated, curUser } = nextProps;
    if (isAuthenticated === true) {
      const event = await this.loadEvent();
      this.setState({ event, curUser });
    }
  }

  async loadEvent() {
    const response = await fetch(`/api/events/${this.props.params.uid}`, {
      credentials: 'same-origin',
    });
    try {
      checkStatus(response);
      const event = await parseJSON(response);
      return event;
    } catch (err) {
      console.log('err at componentWillMount EventDetail', err);
      this.setState({
        notificationIsActive: true,
        notificationMessage: 'Failed to load event. Please try again later.',
      });
      return null;
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

  render() {
    const { event, notificationIsActive, notificationMessage, openDrawer, eventToInvite, curUser } = this.state;
    if (event) {
      return (
        <div styleName="event">
          <EventDetailsComponent event={event} showInviteGuests={this.handleInviteGuests} />
          <GuestInviteDrawer open={openDrawer} event={eventToInvite} curUser={curUser} cb={this.handleCbGustInviteDrawer} />
        </div>
      );
    }
    return (
      <Notification
        isActive={notificationIsActive}
        message={notificationMessage}
        action="Dismiss"
        title="Error!"
        onDismiss={() => this.setState({ notificationIsActive: false })}
        onClick={() => this.setState({ notificationIsActive: false })}
        activeClassName="notification-bar-is-active"
        dismissAfter={10000}
      />
    );
  }
}

EventDetails.propTypes = {
  params: React.PropTypes.object,
  isAuthenticated: React.PropTypes.bool,
  cbOpenLoginModal: React.PropTypes.func,
  curUser: React.PropTypes.object,
};

export default cssModules(EventDetails, styles);
