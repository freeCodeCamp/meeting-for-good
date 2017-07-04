import React from 'react';
import { browserHistory } from 'react-router';
import cssModules from 'react-css-modules';
import RaisedButton from 'material-ui/RaisedButton';
import autobind from 'autobind-decorator';

import styles from './home.css';
import { isAuthenticated } from '../../util/auth';
import dashboardBanner from '../../assets/dashboard-banner.png';
import mainBannerImage from '../../assets/main-banner.png';
import enterAvailImage from '../../assets/enteravail.gif';
import timeZonesImage from '../../assets/timezones.png';
import dashboardBanner2 from '../../assets/dashboard-banner-2.png';
import { loadStats } from '../../util/events';
import LoginModal from '../../components/Login/Login';

class Home extends React.Component {
  static renderContent() {
    return (
      <div styleName="content">
        <hr />
        <div>
          <h3>The best meeting coordination app</h3>
        </div>
        <img src={dashboardBanner} alt="dashboard" />
        <img src={dashboardBanner2} alt="dashboard2" />
        <hr />
        <h3>The best meeting coordination app</h3>
        <img src={dashboardBanner} alt="dashboard" />
        <img src={dashboardBanner2} alt="dashboard2" />
        <h3>Easy event creation</h3>
        <h6>Creating an event is easy as saying 1, 2, 3.</h6>
        <img src={mainBannerImage} alt="new event" />
        <hr styleName="hr" />
        <h3>Entering your availability is a breeze</h3>
        <h6> Using our simplistic availability grid, entering your availability just got easier
        </h6>
        <img src={enterAvailImage} styleName="gifAvail" alt="enter availability" />
        <hr styleName="hr" />
        <h3>Timezones supported</h3>
        <h6>Don&#39;t worry about having to get everyone to convert to your timezone.
          Let us take care of it!</h6>
        <img src={timeZonesImage} styleName="timezones" alt="timezone" />
        <p> <small> Same event. Image on the left: UTC+11.
          Image on the right UTC-5 (Daylight saving included) </small> </p>
      </div>
    );
  }

  static renderFooter() {
    return (
      <footer>
        <div>
          <div styleName={'divider'} />
          <p> An Open Source for Good initiative. </p>
          <p>
            Check out the repo on <a href="https://github.com/freeCodeCamp/meeting-for-good/" target="_blank" rel="noopener noreferrer">GitHub</a>
          </p>
        </div>
      </footer>
    );
  }

  constructor(props) {
    super(props);

    this.state = {
      stats: {
        users: 0,
        events: 0,
        activeEvents: 0,
        avgParticipants: 0,
        maxParticipants: 0,
        eventsToday: 0 },
      openLoginModal: false,
      loginFail: false,
    };
  }

  async componentWillMount() {
    if (sessionStorage.getItem('redirectTo')) {
      browserHistory.push(sessionStorage.getItem('redirectTo'));
      sessionStorage.removeItem('redirectTo');
    }

    try {
      if (await isAuthenticated()) browserHistory.push('/dashboard');

      const stats = await loadStats();
      this.setState({ stats });
    } catch (err) {
      console.log('In index.js: componentWillMount: ', err);
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

  @autobind
  async handleOpenLoginModal() {
    if (await isAuthenticated() === false) {
      sessionStorage.setItem('redirectTo', '/dashboard');
      this.setState({ openLoginModal: true, pathToGo: '/dashboard' });
    }
  }

  renderStats() {
    const { stats } = this.state;
    return (
      <div styleName="statistics">
        <h6>Event creators: <strong>{stats.users}</strong></h6>
        <h6>Total events created until today: <strong>{stats.events}</strong></h6>
        <h6>Events occurring today: <strong>{stats.eventsToday}</strong></h6>
        <h6>Avg. guests for all events: <strong>{stats.avgParticipants}</strong></h6>
        <h6>Max. guests for any event: <strong>{stats.maxParticipants}</strong></h6>
      </div>
    );
  }

  renderHeader() {
    const inlineStyle = { loginButton: { textTransform: 'none' } };
    return (
      <header styleName="header">
        {this.renderStats()}
        <div styleName="title-and-button">
          <h2>Meeting for Good</h2>
          <RaisedButton
            label="Login (it's free!)"
            styleName="loginButton"
            labelStyle={inlineStyle.loginButton}
            onTouchTap={this.handleOpenLoginModal}
          />
        </div>
        <div styleName="dummy-element" />
      </header>
    );
  }

  render() {
    const { openLoginModal, loginFail } = this.state;
    return (
      <div styleName="main">
        {this.renderHeader()}
        {Home.renderContent()}
        {Home.renderFooter()}
        <LoginModal
          open={openLoginModal}
          logFail={loginFail}
          cbCancel={this.handleCancelLoginModal}
        />
      </div>
    );
  }
}


export default cssModules(Home, styles);
