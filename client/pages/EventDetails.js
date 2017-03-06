import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import fetch from 'isomorphic-fetch';
import { Notification } from 'react-notification';

import EventDetailsComponent from '../components/EventDetailsComponent';
import { checkStatus, parseJSON } from '../util/fetch.util';
import LoginModal from '../components/Login';
import styles from '../styles/event-card.css';
import { isAuthenticated } from '../util/auth';

class EventDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      event: null,
      notificationMessage: '',
      notificationIsActive: false,
      showLoginModal: false,
    };
  }

  async componentWillMount() {
    if (await isAuthenticated()) {
      const response = await fetch(`/api/events/${this.props.params.uid}`, {
        credentials: 'same-origin',
      });
      let event;
      try {
        checkStatus(response);
        event = await parseJSON(response);
        this.setState({ event });
      } catch (err) {
        console.log('err at componentWillMount EventDetail', err);
        this.setState({
          notificationIsActive: true,
          notificationMessage: 'Failed to load event. Please try again later.',
        });
        return;
      }
    } else {
      this.setState({ showLoginModal: true });
    }
  }

  render() {
    const { event, showLoginModal, notificationIsActive, notificationMessage } = this.state;
    if (event) {
      return <EventDetailsComponent event={event} />;
    }
    if (showLoginModal) {
      return <LoginModal open={true} />;
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
};

export default cssModules(EventDetails, styles);
