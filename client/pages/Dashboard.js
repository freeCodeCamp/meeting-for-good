/* vendor dependencies */
import React from 'react';
import { browserHistory, Link } from 'react-router';
import fetch from 'isomorphic-fetch';
import cssModules from 'react-css-modules';
import Masonry from 'react-masonry-component';
import autobind from 'autobind-decorator';

/* external components */
import EventCard from '../components/EventCard';

/* styles */
import styles from '../styles/dashboard.css';

/* utilities */
import { checkStatus, parseJSON } from '../util/fetch.util';
import { isAuthenticated } from '../util/auth';

class Dashboard extends React.Component {
  constructor() {
    super();
    this.state = { events: [] };
  }

  async componentWillMount() {
    if (sessionStorage.getItem('redirectTo')) {
      browserHistory.push(sessionStorage.getItem('redirectTo'));
      sessionStorage.removeItem('redirectTo');
    }

    if (!await isAuthenticated()) browserHistory.push('/login');

    const response = await fetch('/api/users/current/events', { credentials: 'same-origin' });
    let events;

    try {
      checkStatus(response);
      events = await parseJSON(response);
    } catch (err) {
      console.log(err); return;
    }

    this.setState({ events });
  }

  @autobind
  removeEventFromDashboard(eventId) {
    this.setState({
      events: this.state.events.filter(event => event._id !== eventId),
    });
  }

  render() {
    return (
      <div styleName="wrapper">
        {/* New Event Icon */}
        <div className="fixed-action-btn" styleName="new-event-icon">
          <Link to="/event/new" className="btn-floating btn-large red">
            <i className="large material-icons">add</i>
          </Link>
        </div>
        {/* Card Template */}
        {this.state.events.length !== 0 ?
          <Masonry>
            {this.state.events.map(event => (
              <EventCard
                key={event._id}
                event={event}
                removeEventFromDashboard={this.removeEventFromDashboard}
              />
            ))}
          </Masonry> :
          <em><h4 styleName="no-select" className="card-title center-align white-text">You have no scheduled events yet.</h4></em>
        }
      </div>
    );
  }
}

export default cssModules(Dashboard, styles);
