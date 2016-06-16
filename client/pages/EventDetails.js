import React from 'react';
import cssModules from 'react-css-modules';
import fetch from 'isomorphic-fetch';

import EventDetailsComponent from '../components/EventDetailsComponent';
import { checkStatus, parseJSON } from '../util/fetch.util';

import styles from '../styles/event-card.css';

class EventDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = { event: null };
  }

  async componentWillMount() {
    const response = await fetch(`/api/events/getbyuid/${this.props.params.uid}`);
    let event;

    try {
      checkStatus(response);
      event = await parseJSON(response);
    } catch (err) {
      console.log(err); return;
    }

    this.setState({ event });
  }

  render() {
    if (this.state.event) {
      return <EventDetailsComponent event={this.state.event} />;
    }
    return null;
  }
}

EventDetails.propTypes = {
  params: React.PropTypes.object,
};

export default cssModules(EventDetails, styles);
