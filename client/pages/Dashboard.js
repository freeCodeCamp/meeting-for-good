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
        <div className="fixed-action-btn" styleName="new-meeting-icon">
          <a className="btn-floating btn-large red" href="/event/new">
            <i className="large material-icons">add</i>
          </a>
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
