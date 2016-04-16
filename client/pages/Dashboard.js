/* vendor dependencies */
import React from 'react';
import fetch from 'isomorphic-fetch';
import cssModules from 'react-css-modules';

/* external components */
import NewMeeting from '../components/NewMeeting';
import MeetingCard from '../components/MeetingCard';

/* styles */
import styles from '../styles/dashboard';

/* utilities */
import { checkStatus, parseJSON } from '../util/fetch.util';

class Dashboard extends React.Component {
  constructor() {
    super();
    this.state = {
      meetings: [],
    };
  }

  componentDidMount() {
    $(document).ready(() => {
      $('.modal-trigger').leanModal();
    });

    fetch('/api/meetings')
      .then(checkStatus)
      .then(parseJSON)
      .then(meetings => this.setState({ meetings }));

    $.get('/api/auth/current', user => {
      if (user === '') window.location.href = '/';
    });
  }

  render() {
    return (
      <div styleName="wrapper">
        { /* New Meeting Icon */ }
        <div className="card hoverable" styleName="new-meeting">
          <div className="card-content">
              <i
                className="material-icons activator large modal-trigger"
                styleName="new-meeting-icon"
                href="#new-meeting-modal"
              >
                note_add
              </i>
          </div>
        </div>
        { /* Card Template */ }
        {this.state.meetings.map(meeting => (
          <MeetingCard key={meeting._id} meeting={meeting} />
        ))}
        { /* New Meeting Modal */ }
        <NewMeeting />
      </div>
    );
  }
}

export default cssModules(Dashboard, styles);
