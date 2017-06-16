import React from 'react';
import { browserHistory } from 'react-router';
import cssModules from 'react-css-modules';

import styles from './home.css';
import { isAuthenticated } from '../../util/auth';
import dashboardBanner from '../../assets/dashboard-banner.png';
import mainBannerImage from '../../assets/main-banner.png';
import enterAvailImage from '../../assets/enteravail.gif';
import timeZonesImage from '../../assets/timezones.png';
import dashboardBanner2 from '../../assets/dashboard-banner-2.png';
import { loadStats } from '../../util/events';

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      stats: { users: 0, events: 0, participants: 0 },
    };
  }

  async componentWillMount() {
    if (sessionStorage.getItem('redirectTo')) {
      browserHistory.push(sessionStorage.getItem('redirectTo'));
      sessionStorage.removeItem('redirectTo');
    }

    if (await isAuthenticated()) browserHistory.push('/dashboard');

    const stats = await loadStats();
    this.setState({ stats });
  }

  render() {
    console.log("In render");
    return (
      <div styleName="main">
        <header styleName="header">
          <h2>Meeting for Good</h2>
          <hr />
          <h6>The best meeting coordination app</h6>
          <h6 styleName="statistics">Event owners: {this.state.stats.users}, Events: {this.state.stats.events}, 
            Participants: {this.state.stats.participants}</h6>
          <img
            src={dashboardBanner}
            alt="dashboard"
          />
          <img
            src={dashboardBanner2}
            alt="dashboard2"
          />
        </header>
        <div styleName="content">
          <h3>Easy event creation</h3>
          <h6>Creating an event is easy as saying 1, 2, 3.</h6>
          <img src={mainBannerImage} alt="new event" />
          <hr styleName="hr" />
          <h3>Entering your availability is a breeze</h3>
          <h6>
            Using our simplistic availability grid, entering your availability just got easier
            </h6>
          <img src={enterAvailImage} styleName="gif" alt="enter availability" />
          <hr styleName="hr" />
          <h3>Timezones supported</h3>
          <h6>
            Don&#39;t worry about having to get everyone to convert to your timezone.
            Let us take care of it!
          </h6>
          <img src={timeZonesImage} styleName="timezones" alt="timezone" />
          <p>
            <small>
              Same event. Image on the left: UTC+11.
              Image on the right UTC-5 (Daylight saving included)
            </small>
          </p>
        </div>
        <footer>
          <div>
            <div styleName={'divider'} />
            <p>
              An Open Source for Good initiative.
            </p>

            <p>
              Check out the repo on <a href="https://github.com/freeCodeCamp/meeting-for-good/" target="_blank" rel="noopener noreferrer">GitHub</a>
            </p>
          </div>
        </footer>
      </div>
    );
  }
}

export default cssModules(Home, styles);
