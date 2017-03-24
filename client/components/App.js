import React, { Component, cloneElement } from 'react';
import autobind from 'autobind-decorator';
import { browserHistory } from 'react-router';

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
    };
  }

  async componentWillMount() {
    if (await isAuthenticated()) {
      const { showPastEvents } = this.state;
      const curUser = await getCurrentUser();
      const events = await loadEvents(showPastEvents);
      this.setState({ isAuthenticated: true, openLoginModal: false, curUser, events, showPastEvents });
    }
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
      return true;
    }
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
      return true;
    }
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
      this.setState({ isAuthenticated: true, openLoginModal: false, curUser });
      if (sessionStorage.getItem('redirectTo')) {
        browserHistory.push(sessionStorage.getItem('redirectTo'));
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
