import React, { Component } from 'react';
import cssModules from 'react-css-modules';
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
  handleEditEvent(patches, eventId) {
    return this.props.cbEditEvent(patches, eventId);
  }

  @autobind
  handleCbGuestInviteDrawer(open) {
    this.setState({ openDrawer: open });
  }

  @autobind
  async handleDeleteEvent(id) {
    const response = await this.props.cbDeleteEvent(id);
    if (response) {
      browserHistory.push('/dashboard');
    }
  }

  @autobind
  async handleDeleteGuest(guestToDelete) {
    const response = await this.props.cbDeleteGuest(guestToDelete);
    return response;
  }


  render() {
    const { event, openDrawer, eventToInvite, curUser } = this.state;
    if (event) {
      return (
        <div styleName="event">
          <EventDetailsComponent
            event={event}
            curUser={curUser}
            showInviteGuests={this.handleInviteGuests}
            cbDeleteEvent={this.handleDeleteEvent}
            cbEditEvent={this.handleEditEvent}
            cbDeleteGuest={this.handleDeleteGuest}
          />
          <GuestInviteDrawer open={openDrawer} event={eventToInvite} curUser={curUser} cb={this.handleCbGuestInviteDrawer} />
        </div>
      );
    }
  }
}

EventDetails.propTypes = {
  params: React.PropTypes.object,
  isAuthenticated: React.PropTypes.bool,
  cbOpenLoginModal: React.PropTypes.func,
  curUser: React.PropTypes.object,
  cbLoadEvent: React.PropTypes.func,
  cbDeleteEvent: React.PropTypes.func,
  cbEditEvent: React.PropTypes.func,
  cbDeleteGuest: React.PropTypes.func,
};

export default cssModules(EventDetails, styles);
