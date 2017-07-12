import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import autobind from 'autobind-decorator';
import { browserHistory } from 'react-router';
import PropTypes from 'prop-types';

import EventDetailsComponent from '../../components/EventDetailsComponent/EventDetailsComponent';
import styles from './event-details.css';
import GuestInviteDrawer from '../../components/GuestInviteDrawer/GuestInviteDrawer';
import { listCalendarEvents } from '../../util/calendar';
import { eventsMaxMinDatesForEvent } from '../../util/dates.utils';

class EventDetails extends Component {
  constructor(props) {
    super(props);
    this.state = { event: null,
      showLoginModal: false,
      openDrawer: false,
      curUser: {},
      isAuthenticated: false,
    };
  }

  async componentWillMount() {
    const { isAuthenticated, curUser, cbLoadEvent } = this.props;
    if (isAuthenticated === false) {
      this.props.cbOpenLoginModal(`/event/${this.props.params.uid}`);
    } else {
      try {
        await this.loadEventsAndCalendar(isAuthenticated, curUser, cbLoadEvent);
      } catch (err) {
        console.error('eventDetails componentWillMount', err);
      }
    }
  }

  async componentWillReceiveProps(nextProps) {
    const { isAuthenticated, curUser, cbLoadEvent } = nextProps;
    try {
      await this.loadEventsAndCalendar(isAuthenticated, curUser, cbLoadEvent);
    } catch (err) {
      console.error('eventDetails componentWillReceiveProps', err);
    }
  }

  async loadEventsAndCalendar(isAuthenticated, curUser, cbLoadEvent) {
    if (isAuthenticated === true) {
      try {
        const event = await cbLoadEvent(this.props.params.uid);
        const calendarEvents = await listCalendarEvents(eventsMaxMinDatesForEvent(event), curUser);
        this.setState({ event, curUser, calendarEvents });
      } catch (err) {
        console.error('eventDetails loadEventsAndCalendar', err);
      }
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
  async HandleEmailOwnerEdit(event) {
    await this.props.cbEmailOwnerEdit(event);
  }

  @autobind
  async handleDeleteGuest(guestToDelete) {
    const nEvent = await this.props.cbDeleteGuest(guestToDelete);
    this.setState({ event: nEvent });
    return nEvent;
  }

  @autobind
  async HandleInviteEmail(guestId, event) {
    const nEvent = await this.props.cbInviteEmail(guestId, event);
    if (nEvent) this.setState({ event: nEvent });
    return nEvent;
  }

  render() {
    const { event, openDrawer, curUser, calendarEvents } = this.state;
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
            cbHandleEmailOwnerEdit={this.HandleEmailOwnerEdit}
            cbDeleteGuest={this.handleDeleteGuest}
            calendarEvents={calendarEvents}
          />
          <GuestInviteDrawer
            open={openDrawer}
            event={event}
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
  cbEmailOwnerEdit: () => { console.log('cbEmailEdit func not passed in!'); },
  cbDeleteGuest: () => { console.log('cbDeleteGuest func not passed in!'); },
  cbInviteEmail: () => { console.log('cbInviteEmail func not passed in!'); },
  params: () => { console.log('params not passed in!'); },
};

EventDetails.propTypes = {
  params: PropTypes.objectOf(PropTypes.string),
  cbDeleteEvent: PropTypes.func,
  cbEditEvent: PropTypes.func,
  cbEmailOwner: PropTypes.func,
  cbEmailOwnerEdit: PropTypes.func,
  cbDeleteGuest: PropTypes.func,
  cbInviteEmail: PropTypes.func,
};

export default cssModules(EventDetails, styles);
