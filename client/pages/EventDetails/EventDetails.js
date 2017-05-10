import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import autobind from 'autobind-decorator';
import { browserHistory } from 'react-router';
import PropTypes from 'prop-types';

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
  async HandleEmailOwner(event) {
    await this.props.cbEmailOwner(event);
  }

  @autobind
  async handleDeleteGuest(guestToDelete) {
    const nEvent = await this.props.cbDeleteGuest(guestToDelete);
    this.setState({ event: nEvent });
    return nEvent;
  }

  @autobind
  async HandleInviteEmail(guestId, event, curUser) {
    const response = await this.props.cbInviteEmail(guestId, event, curUser);
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
            cbHandleEmailOwner={this.HandleEmailOwner}
            cbDeleteGuest={this.handleDeleteGuest}
          />
          <GuestInviteDrawer
            open={openDrawer}
            event={eventToInvite}
            curUser={curUser}
            cb={this.handleCbGuestInviteDrawer}
            cbInviteEmail={this.HandleInviteEmail}
          />
        </div>
      );
    }
  }
}

EventDetails.defaultProps = {
  cbDeleteEvent: () => { console.log('cbDeleteEvent func not passed in!'); },
  cbEditEvent: () => { console.log('cbEditEvent func not passed in!'); },
  cbEmailOwner: () => { console.log('cbEmailOwner func not passed in!'); },
  cbDeleteGuest: () => { console.log('cbDeleteGuest func not passed in!'); },
  cbInviteEmail: () => { console.log('cbInviteEmail func not passed in!'); },
};

EventDetails.propTypes = {
  cbDeleteEvent: PropTypes.func,
  cbEditEvent: PropTypes.func,
  cbEmailOwner: PropTypes.func,
  cbDeleteGuest: PropTypes.func,
  cbInviteEmail: PropTypes.func,
};

export default cssModules(EventDetails, styles);
