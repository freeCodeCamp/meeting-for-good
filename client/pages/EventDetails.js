import React from "react";
import CSSModules from 'react-css-modules';
import styles from '../styles/main';
import MeetingEvent from "../components/MeetingEvent";
import fetch from 'isomorphic-fetch';
import { checkStatus, parseJSON } from '../util/fetch.util';

class EventDetails extends React.Component {
  constructor() {
    super();
    this.state = { events: [] };
  }

  componentDidMount() {
    fetch('/api/events')
      .then(checkStatus)
      .then(parseJSON)
      .then(events => {
        events.forEach(event => {
          if (event.uid === this.props.params.uid) {
            this.setState({ events: [event] });
          }
        });
      });
  }

  render() {
    return (
      <div>
        {
          this.state.events.map(event => (
            <MeetingEvent key={event._id} event={event} />
          ))
        }
      </div>
    );
  }
}

export default CSSModules(EventDetails, styles);
