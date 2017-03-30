import React, { Component, cloneElement } from 'react';
import autobind from 'autobind-decorator';
import { browserHistory } from 'react-router';
import NotificationSystem from 'react-notification-system';

import LoginModal from '../components/Login/Login';
import NavBar from '../components/NavBar/NavBar';
import { getCurrentUser, isAuthenticated } from '../util/auth';
import { loadEvents, loadEvent, addEvent, deleteEvent, editEvent } from '../util/events';


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
      noCurEvents: false,
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
    const event = events.filter(event => event._id === id);
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
    this._addNotification('Events', `Event ${nEvent.name} created`, 'success');
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
    const response = await editEvent(patches, eventId);
    if (response) {
      const eventEdited  = await loadEvent(eventId);
      const nEvents = events.filter(event => event._id !== eventId);
      this.setState({ events: [eventEdited, ...nEvents] });
      this._addNotification('Success', 'Saved availability successfully.', 'success');
      return true;
    }
    this._addNotification('Error!!', 'Failed to update availability. Please try again later.', 'error');
    return false;
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
          this.setState({ noCurEvents: true }, browserHistory.push('/event/new'));
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
  handleNoCurEventsMessage() {
    this.setState({ noCurEvents: false });
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
      noCurEvents,
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
          });
        }
        if (child.type.displayName === 'NewEvent') {
          return cloneElement(child, {
            curUser,
            isAuthenticated,
            noCurEvents,
            cbOpenLoginModal: this.handleOpenLoginModal,
            cbNewEvent: this.handleNewEvent,
            cbNoCurEventsMsg: this.handleNoCurEventsMessage,
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
  children: React.PropTypes.element,
  location: React.PropTypes.object.isRequired,
};

export default App;
