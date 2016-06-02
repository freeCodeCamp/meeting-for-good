import React from 'react';
import cssModules from 'react-css-modules';
import fetch from 'isomorphic-fetch';

import EventCardMore from '../components/EventCardMore';
import { checkStatus, parseJSON } from '../util/fetch.util';

import styles from '../styles/main.css';

class EventDetails extends React.Component {
  constructor() {
    super();
    this.state = { events: [] };
  }

  componentDidMount() {
    fetch(`/api/events/getbyuid/${this.props.params.uid}`)
      .then(checkStatus)
      .then(parseJSON)
      .then(event => {
        this.setState({ events: event });
      });
  }

  render() {
    return (
      <div>
        {
          this.state.events.map(event => (
            <EventCardMore key={event._id} event={event} />
          ))
        }
      </div>
    );
  }
}

EventDetails.propTypes = {
  params: React.PropTypes.object,
};

export default cssModules(EventDetails, styles);
