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
  loadEvents, EditStatusParticipantEvent, AddEventParticipant,
  addEvent, deleteEvent, editEvent, deleteGuest,
  handleDismiss, loadEvent,
} from '../util/events';
import { sendEmailInvite } from '../util/emails';
import '../styles/main.css';
import { handleLoadEvent, handleEmailOwner } from './AppHandlers';
import editCurUser from '../util/curUser';

const styleNotif = {
  NotificationItem: { // Override the notification item
    DefaultStyle: { margin: '10px 5px 2px 1px', fontSize: '15px' },
    success: { backgroundColor: 'white', color: '#006400', borderTop: '4px solid #006400' },
    error: { backgroundColor: 'white', color: 'red', borderTop: '2px solid red' },
    info: { backgroundColor: 'white', color: 'blue', borderTop: '2px solid blue' },
    Containers: { tr: { top: '40px', bottom: 'auto', left: 'auto', right: '0px' } },
    Title: {
      DefaultStyle: { fontSize: '18px', fontWeight: 'bold' },
    },
  },
};

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
    try {
      const isAuth = await isAuthenticated();
      if (isAuth) {
        const showPastEvents = (sessionStorage.getItem('showPastEvents')) ? sessionStorage.getItem('showPastEvents') === 'true' : false;
        const curUser = await getCurrentUser();
        const events = await loadEvents(showPastEvents);
        this.setState({
          isAuthenticated: true, openLoginModal: false, curUser, events, showPastEvents });
      }
    } catch (err) {
      console.error('App.js componentWillMount err', err);
    }
  }

  _addNotification(title, message, level, autoDismiss = 4) {
    this._notificationSystem.addNotification({
      title,
      message,
      level, // possible level values: info, success, error, warning
      autoDismiss, // autoDismiss time in seconds
      position: 'tr',
    });
  }

  @autobind
  async toggleFilterPastEventsTo(value) {
    const events = await loadEvents(value);
    this.setState({ showPastEvents: value, events });
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
    const nEvent = await editEvent(patches, eventId);
    if (nEvent) {
      const nEvents = _.cloneDeep(events);
      nEvents.splice(_.findIndex(nEvents, ['_id', nEvent._id.toString()]), 1, nEvent);
      this.setState({ events: nEvents });
      this._addNotification('Success', 'Saved availability successfully.', 'success');
      return nEvent;
    }
    this._addNotification('Error!!', 'Failed to update availability. Please try again later.', 'error');
    return false;
  }

  @autobind
  handleLogin(curUser) {
    if (Object.keys(curUser).length > 0) this.setState({ curUser, isAuthenticated: true });
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

  @autobind
  async handleDeleteGuest(guestToDelete) {
    const { events } = this.state;
    const nEvents = _.cloneDeep(events);
    try {
      const nEvent = await deleteGuest(guestToDelete);
      nEvents.splice(_.findIndex(nEvents, ['_id', nEvent._id.toString()]), 1, nEvent);
      this._addNotification('Success', 'Guest deleted successfully.', 'success');
      this.setState({ events: nEvents });
      return nEvent;
    } catch (err) {
      this._addNotification('Error!!', 'Failed delete guest. Please try again later.', 'error');
      return null;
    }
  }

  async handleInviteExistingGuest(guestId, event, participants, indexOfGuest) {
    const { events, curUser } = this.state;
    const status = participants[indexOfGuest].status;
    let statusResult = null;
    switch (status) {
      case 0: // guest "deleted"
        try {
          const nEvent = await EditStatusParticipantEvent(guestId, event, 1);
          await this.sendInviteEmail(guestId, event, curUser);
          this._addNotification('Info', 'Guest alredy invited for this event.Invite sended again', 'info');
          const nEvents = events.filter(event => event._id !== nEvent._id);
          this.setState({ events: [nEvent, ...nEvents] });
          statusResult = nEvent;
        } catch (err) {
          this._addNotification('Error!!', 'Error sending invite, please try again later', 'error');
        }
        break;
      case 1: // guest alredy invited
        try {
          await this.sendInviteEmail(guestId, event, curUser);
          this._addNotification('Info', 'Guest alredy invited for this event.Invite sended again', 'info');
          statusResult = event;
        } catch (err) {
          this._addNotification('Error!!', 'Error sending invite, please try again later', 'error');
        }
        break;
      case 2: // guest alredy join
        this._addNotification('Info', 'Guest alredy join this event.', 'info');
        statusResult = event;
        break;
      case 3: // guest alredy set a time table
        this._addNotification('Info', 'Guest alredy set a time table for this event.', 'info');
        statusResult = event;
        break;
      default:
        this._addNotification('Error', 'Guest whith a not possible statust.', 'error');
        statusResult = null;
    }
    return statusResult;
  }

  async sendInviteEmail(guestId, event, curUser) {
    try {
      await sendEmailInvite(guestId, event, curUser);
      this._addNotification('Success', 'Invite send successfully.', 'success');
      return true;
    } catch (err) {
      this._addNotification('Error!', 'Failed to invite guest. Please try again later.', 'error');
      return err;
    }
  }

  @autobind
  async handleInviteEmail(guestId, eventEdited) {
    const { events, curUser } = this.state;
    // find if the guest alredy exists as participant
    // ask at DB because guests sets as 0 its not load as default
    const eventFull = await loadEvent(eventEdited._id, true);
    const participants = eventFull.participants;
    const indexOfGuest = _.findIndex(
      participants, participant => participant.userId._id === guestId.toString());
    if (indexOfGuest > -1) {
      return this.handleInviteExistingGuest(guestId, eventFull, participants, indexOfGuest);
    }
    // if wasn't a participant,  then add
    const nEvent = await AddEventParticipant(guestId, eventFull);
    if (nEvent) {
      const nEvents = _.cloneDeep(events);
      nEvents.splice(_.findIndex(nEvents, ['_id', nEvent._id.toString()]), 1, nEvent);
      this.setState({ events: nEvents });
      try {
        await this.sendInviteEmail(guestId, nEvent, curUser);
        return nEvent;
      } catch (err) {
        this._addNotification('Error!!', 'Error sending invite, please try again later', 'error');
        return null;
      }
    }
  }

  @autobind
  async handleGuestNotificationsDismiss(participantsIds) {
    const { events } = this.state;
    const nEvents = _.cloneDeep(events);
    try {
      await Promise.all(participantsIds.map(
        async (participantId) => {
          const nEvent = await handleDismiss(participantId.toString());
          nEvents.splice(_.findIndex(nEvents, ['_id', nEvent._id.toString()]), 1, nEvent);
        },
      ));
    } catch (err) {
      this._addNotification('Error!', 'Failed to dismiss guest. Please try again later.', 'error');
      return err;
    } finally {
      this.setState({ events: nEvents });
    }
    return nEvents;
  }

  @autobind
  async handleEditCurUser(patches) {
    const { curUser } = this.state;
    try {
      const nCurUser = await editCurUser(patches, curUser._id);
      this.setState({ curUser: nCurUser });
      return nCurUser;
    } catch (err) {
      console.error('error at app handleEditCurUser', err);
      return err;
    }
  }

  injectPropsChildren(child) {
    const { showPastEvents, curUser, isAuthenticated, events } = this.state;
    if (child.type.displayName === 'Dashboard') {
      return cloneElement(child, { showPastEvents,
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
      return cloneElement(child, { curUser,
        isAuthenticated,
        cbOpenLoginModal: this.handleOpenLoginModal,
        cbLoadEvent: id => handleLoadEvent(id),
        cbDeleteEvent: this.handleDeleteEvent,
        cbEditEvent: this.handleEditEvent,
        cbEmailOwner: event => handleEmailOwner(event, curUser),
        cbEmailOwnerEdit: event => handleEmailOwner(event, curUser, true),
        cbDeleteGuest: this.handleDeleteGuest,
        cbInviteEmail: this.handleInviteEmail,

      });
    }
    if (child.type.displayName === 'NewEvent') {
      return cloneElement(child, { curUser,
        isAuthenticated,
        cbOpenLoginModal: this.handleOpenLoginModal,
        cbNewEvent: this.handleNewEvent,
      });
    }
    return cloneElement(child,
      { curUser, isAuthenticated, cbOpenLoginModal: this.handleOpenLoginModal });
  }

  renderNotifications() {
    return (
      <NotificationSystem ref={(ref) => { this._notificationSystem = ref; }} style={styleNotif} />
    );
  }

  render() {
    const { location, children } = this.props;
    const { showPastEvents, curUser, openLoginModal, isAuthenticated, loginFail, events,
    } = this.state;
    const childrenWithProps = React.Children
      .map(children, child => this.injectPropsChildren(child));
    return (
      <div>
        {this.renderNotifications()}
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
          cbEditCurUser={this.handleEditCurUser}
        />
        <main className="main"> {childrenWithProps} </main>
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
