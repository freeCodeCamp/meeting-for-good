import React, { Component, cloneElement } from 'react';
import autobind from 'autobind-decorator';
import { browserHistory } from 'react-router';
import NotificationSystem from 'react-notification-system';
import PropTypes from 'prop-types';
import _ from 'lodash';

import LoginModal from '../components/Login/Login';
import NavBar from '../components/NavBar/NavBar';
import { getCurrentUser, isAuthenticated } from '../util/auth';
import {
  loadEvents, loadEvent, EditStatusParticipantEvent, AddEventParticipant,
  addEvent, deleteEvent, editEvent, loadOwnerData, deleteGuest, loadEventFull,
  handleDismiss,
} from '../util/events';
import { sendEmailOwner, sendEmailInvite, sendEmailOwnerEdit } from '../util/emails';
import '../styles/main.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPastEvents: false,
      curUser: {},
      openLoginModal: false,
      isAuthenticated: false,
      loginFail: false,
      pathToGo: '/',
      loginModalDisable: false,
      events: [],
    };
    this._notificationSystem = null;
  }

  async componentWillMount() {
    if (await isAuthenticated()) {
      let showPastEvents;
      if (sessionStorage.getItem('showPastEvents')) {
        showPastEvents = sessionStorage.getItem('showPastEvents') === 'true';
      }
      const curUser = await getCurrentUser();
      const events = await loadEvents(showPastEvents);
      this.setState({ isAuthenticated: true, openLoginModal: false, curUser, events, showPastEvents });
    }
  }

  /**
   * possible level values: info, success, error, warning
   * autoDismiss time in seconds
   */
  _addNotification(title, message, level, autoDismiss = 4) {
    this._notificationSystem.addNotification({
      title,
      message,
      level,
      autoDismiss,
      position: 'tr',
    });
  }

  @autobind
  async toggleFilterPastEventsTo(value) {
    const events = await loadEvents(value);
    this.setState({ showPastEvents: value, events });
  }

  @autobind
  async handleLoadEvent(id) {
    const { events } = this.state;
    const event = events.filter(event => event._id.toString() === id.toString());
    if (event.length === 0) {
      const event = await loadEvent(id);
      if (event === null) {
        this._addNotification('Error!!', 'I can\'t load event, please try again latter', 'error', 8);
        return false;
      }
      return event;
    }
    return event[0];
  }

  @autobind
  async handleNewEvent(event) {
    const { events } = this.state;
    const nEvent = await addEvent(event);
    this.setState({ events: [nEvent, ...events] });
    return nEvent;
  }

  @autobind
  async handleDeleteEvent(id) {
    const { events } = this.state;
    const response = await deleteEvent(id);
    if (response) {
      const nEvents = events.filter(event => event._id !== id);
      this.setState({ events: nEvents });
      this._addNotification('Success!', 'Event deleted', 'success');
      return true;
    }
    this._addNotification('Error!!', 'delete event error, please try again latter', 'error', 8);
    return false;
  }

  @autobind
  async handleEditEvent(patches, eventId) {
    const { events } = this.state;
    const eventEdited = await editEvent(patches, eventId);
    if (eventEdited) {
      const nEvents = events.filter(event => event._id !== eventId);
      this.setState({ events: [eventEdited, ...nEvents] });
      this._addNotification('Success', 'Saved availability successfully.', 'success');
      return eventEdited;
    }
    this._addNotification('Error!!', 'Failed to update availability. Please try again later.', 'error');
    return false;
  }

  @autobind
  async handleEmailOwner(event) {
    const { curUser } = this.state;
    const ownerData = await loadOwnerData(event.owner);
    if (ownerData !== null) {
      const response = await sendEmailOwner(event, curUser, ownerData);
      if (response) {
        return true;
      }
      return false;
    }
  }

  @autobind
  async handleEmailOwnerEdit(event) {
    const { curUser } = this.state;
    const ownerData = await loadOwnerData(event.owner);
    if (ownerData !== null) {
      const response = await sendEmailOwnerEdit(event, curUser, ownerData);
      if (response) {
        return true;
      }
      return false;
    }
  }

  @autobind
  handleLogin(curUser) {
    if (Object.keys(curUser).length > 0) {
      this.setState({ curUser, isAuthenticated: true });
    }
  }

  @autobind
  async handleAuthentication(result) {
    if (result) {
      const curUser = await getCurrentUser();
      const events = await loadEvents(false);
      const redirectTo = sessionStorage.getItem('redirectTo');
      this.setState({ isAuthenticated: true, openLoginModal: false, curUser });
      if (redirectTo) {
        if (redirectTo === '/dashboard' && events.length === 0) {
          browserHistory.push('/event/new');
        } else {
          browserHistory.push(redirectTo);
        }
        sessionStorage.removeItem('redirectTo');
      }
    } else {
      sessionStorage.removeItem('redirectTo');
      this.setState({ loginFail: true });
      browserHistory.push('/');
    }
  }

  @autobind
  async handleOpenLoginModal(pathToGo) {
    if (await isAuthenticated() === false) {
      sessionStorage.setItem('redirectTo', pathToGo);
      this.setState({ openLoginModal: true, pathToGo });
    }
  }

  @autobind
  handleCancelLoginModal() {
    this.setState({ openLoginModal: false });
    if (sessionStorage.getItem('redirectTo')) {
      sessionStorage.removeItem('redirectTo');
    }
    browserHistory.push('/');
  }

  /**
  *
  * @param {*} guestToDelete the Id of the document content the guest
  */
  @autobind
  async handleDeleteGuest(guestToDelete) {
    const { events } = this.state;
    const eventEdited = await deleteGuest(guestToDelete);
    if (eventEdited) {
      const nEvents = events.filter(event => event._id !== eventEdited._id);
      this.setState({ events: [eventEdited, ...nEvents] });
      this._addNotification('Success', 'Guest deleted successfully.', 'success');
      return eventEdited;
    }
    this._addNotification('Error!!', 'Failed delete guest. Please try again later.', 'error');
    return eventEdited;
  }

  /**
   *
   * @param {*} guestId the id of the guest to be invited
   * @param {*} event object contening the event
   * @param {*} curUser current user
   *
   * using the invite issued at the inviteDrawer
   * fist chech if the guestId is alredy at the event
   * if was not update the event at the db with a new guest
   * status 1 as invited
   * then send a inivte email
   */
  @autobind
  async handleInviteEmail(guestId, event, curUser) {
    const { events } = this.state;
    // find if the guest alredy exists as participant
    // ask at DB because guests sets as 0 its not load as default
    event = await loadEventFull(event._id);
    const participants = event.participants;
    const indexOfGuest = _.findIndex(participants, participant => participant.userId._id === guestId.toString());
    if (indexOfGuest > -1) {
      const status = participants[indexOfGuest].status;
      if (status === 0) {
        const nEvent = await EditStatusParticipantEvent(guestId, event, 1);
        if (nEvent) {
          const responseEmail = await this.sendInviteEmail(guestId, event, curUser);
          if (responseEmail) {
            this._addNotification('Info', 'Guest alredy invited for this event.Invite sended again', 'info');
            const nEvents = events.filter(event => event._id !== nEvent._id);
            this.setState({ events: [nEvent, ...nEvents] });
            return true;
          }
          this._addNotification('Error!!', 'Error sending invite, please try again later', 'error');
          return false;
        }
        this._addNotification('Error!!', 'Error updating the guest status, please try again later', 'error');
        return false;
      } else if (status === 1) {
        const responseEmail = await this.sendInviteEmail(guestId, event, curUser);
        if (responseEmail) {
          this._addNotification('Info', 'Guest alredy invited for this event.Invite sended again', 'info');
          return true;
        }
        return false;
      } else if (status === 2) {
        this._addNotification('Info', 'Guest alredy join this event.', 'info');
        return true;
      } else if (status === 3) {
        this._addNotification('Info', 'Guest alredy set a time table for this event.', 'info');
        return true;
      }
    }
    // if wasn't a participant then add
    const nEvent = await AddEventParticipant(guestId, event);
    if (nEvent) {
      const nEvents = events.filter(event => event._id !== nEvent._id);
      this.setState({ events: [nEvent, ...nEvents] });
      const responseEmail = await this.sendInviteEmail(guestId, event, curUser);
      if (responseEmail) {
        return nEvent;
      }
      this._addNotification('Error!!', 'Error sending invite, please try again later', 'error');
      return false;
    }
  }

  async sendInviteEmail(guestId, event, curUser) {
    const result = await sendEmailInvite(guestId, event, curUser);
    if (result) {
      this._addNotification('Success', 'Invite send successfully.', 'success');
      return result;
    }
    this._addNotification('Error!', 'Failed to invite guest. Please try again later.', 'error');
    return result;
  }

  @autobind
  async handleGuestNotificationsDismiss(participantId) {
    const { events } = this.state;
    const nEvent = await handleDismiss(participantId);
    if (nEvent) {
      const nEvents = events.filter(event => event._id !== nEvent._id);
      this.setState({ events: [nEvent, ...nEvents] });
      return nEvent;
    }
    this._addNotification('Error!', 'Failed to dismiss guest. Please try again later.', 'error');
    return nEvent;
  }

  render() {
    const { location } = this.props;
    const {
      showPastEvents,
      curUser,
      openLoginModal,
      isAuthenticated,
      loginFail,
      events,
    } = this.state;

    const style = {
      NotificationItem: { // Override the notification item
        DefaultStyle: { // Applied to every notification, regardless of the notification level
          margin: '10px 5px 2px 1px',
          fontSize: '15px',
        },
        success: { // Applied only to the success notification item
          backgroundColor: 'white',
          color: '#006400',
          borderTop: '4px solid #006400',
        },
        error: {
          backgroundColor: 'white',
          color: 'red',
          borderTop: '2px solid red',
        },
        info: {
          backgroundColor: 'white',
          color: 'blue',
          borderTop: '2px solid blue',
        },
      },
      Containers: {
        tr: {
          top: '40px',
          bottom: 'auto',
          left: 'auto',
          right: '0px',
        },
      },
      Title: {
        DefaultStyle: {
          fontSize: '18px',
          fontWeight: 'bold',
        },
      },
    };

    const childrenWithProps = React.Children.map(this.props.children,
      (child) => {
        if (child.type.displayName === 'Dashboard') {
          return cloneElement(child, {
            showPastEvents,
            curUser,
            isAuthenticated,
            cbOpenLoginModal: this.handleOpenLoginModal,
            cbDeleteEvent: this.handleDeleteEvent,
            cbDeleteGuest: this.handleDeleteGuest,
            cbInviteEmail: this.handleInviteEmail,
            events,
          });
        }
        if (child.type.name === 'LoginController') {
          return cloneElement(child, { handleAuthentication: this.handleAuthentication });
        }
        if (child.type.displayName === 'EventDetails') {
          return cloneElement(child, {
            curUser,
            isAuthenticated,
            cbOpenLoginModal: this.handleOpenLoginModal,
            cbLoadEvent: this.handleLoadEvent,
            cbDeleteEvent: this.handleDeleteEvent,
            cbEditEvent: this.handleEditEvent,
            cbEmailOwner: this.handleEmailOwner,
            cbEmailOwnerEdit: this.handleEmailOwnerEdit,
            cbDeleteGuest: this.handleDeleteGuest,
            cbInviteEmail: this.handleInviteEmail,

          });
        }
        if (child.type.displayName === 'NewEvent') {
          return cloneElement(child, {
            curUser,
            isAuthenticated,
            cbOpenLoginModal: this.handleOpenLoginModal,
            cbNewEvent: this.handleNewEvent,
          });
        }
        return cloneElement(child, {
          curUser,
          isAuthenticated,
          cbOpenLoginModal: this.handleOpenLoginModal,
        });
      });

    return (
      <div>
        <NotificationSystem ref={(ref) => { this._notificationSystem = ref; }} style={style} />
        <LoginModal
          open={openLoginModal}
          logFail={loginFail}
          cbCancel={this.handleCancelLoginModal}
        />
        <NavBar
          location={location}
          cbFilter={this.toggleFilterPastEventsTo}
          isAuthenticated={isAuthenticated}
          curUser={curUser}
          cbOpenLoginModal={this.handleOpenLoginModal}
          cbHandleDismissGuest={this.handleGuestNotificationsDismiss}
          events={events}
          showPastEvents={showPastEvents}
        />
        <main className="main">
          {childrenWithProps}
        </main>
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.element.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,

};

export default App;
