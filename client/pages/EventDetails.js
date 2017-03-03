import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import fetch from 'isomorphic-fetch';
import { Notification } from 'react-notification';

import EventDetailsComponent from '../components/EventDetailsComponent';
import { checkStatus, parseJSON } from '../util/fetch.util';
import LoginModal from '../components/login';
import styles from '../styles/event-card.css';
import { isAuthenticated } from '../util/auth';

class EventDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      event: null,
      notificationMessage: '',
      notificationIsActive: false,
      showModal: false,
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
      this.setState({ showModal: true });
    }
  }

  render() {
    const { event, showModal, notificationIsActive, notificationMessage } = this.state;
    if (event) {
      return <EventDetailsComponent event={event} />;
    }
    if (showModal) {
      return <LoginModal />;
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
