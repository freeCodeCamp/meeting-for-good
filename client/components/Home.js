import React from 'react';
import { browserHistory } from 'react-router';
import cssModules from 'react-css-modules';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Actions from '../actions/';
import styles from '../styles/home.css';
import dashboardBanner from '../assets/dashboard-banner.jpg';
import mainBanner from '../assets/main-banner.jpg';
import enterAvail from '../assets/enteravail.gif';
import timezones from '../assets/timezones.png';

class Home extends React.PureComponent {
  componentWillMount() {
    this.props.actions.fetchCurrentUser();
  }

  componentWillReceiveProps(nextProps) {
    const { userAuth } = nextProps;
    if (userAuth !== undefined && userAuth) {
      browserHistory.push('/dashboard');
    }
  }

  render() {
    return (
      <div styleName="main">
        <header styleName="header">
          <h2>LetsMeet</h2>
          <hr />
          <h6>The best meeting coordination app</h6>
          <img
            src={dashboardBanner}
            alt="dashboard"
          />
        </header>
        <div styleName="content">
          <h3>Easy event creation</h3>
          <h6>Creating an event is easy as saying 1, 2, 3.</h6>
          <img src={mainBanner} alt="new event" />
          <hr styleName="hr" />
          <h3>Entering your availabily is a breeze</h3>
          <h6>Using our simplistic availabily grid, entering your availabily just got easier</h6>
          <img src={enterAvail} styleName="gif" alt="enter availabily" />
          <hr styleName="hr" />
          <h3>Timezones supported</h3>
          <h6>Don&#39;t worry about having to get everyone to convert to your timezone. Let us take of it!</h6>
          <img src={timezones} styleName="timezones" alt="timezone" />
          <p><small>Same event. Image on the left: UTC+11. Image on the right UTC-5 (Daylight saving included)</small></p>
        </div>
        <footer>
          <div>
            <p>Made with ❤ by &nbsp;
              <a
                href="https://github.com/AkiraLaine"
                target="_blank"
                rel="noopener noreferrer"
              >Akira Laine</a>, &nbsp;
              <a
                href="https://github.com/awesomeaniruddh/"
                target="_blank"
                rel="noopener noreferrer"
              >Aniruddh Agarwal</a>  and&nbsp;
              <a
                href="https://github.com/jrogatis/"
                target="_blank"
                rel="noopener noreferrer"
              >Jean Philip de Rogatis</a>
            </p>

            <p>
              Check out the repo on <a
                href="https://github.com/FreeCodeCamp/LetsMeet"
                target="_blank"
                rel="noopener noreferrer"
              >GitHub</a>
            </p>
          </div>
        </footer>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  userAuth: state.entities.userAuth,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(Actions, dispatch),
});

Home.propTypes = {
  actions: React.PropTypes.shape({
    fetchCurrentUser: React.PropTypes.func.isRequired,
  }),
};

export default connect(mapStateToProps, mapDispatchToProps)(cssModules(Home, styles));
