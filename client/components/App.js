import React, { Component, cloneElement } from 'react';
import autobind from 'autobind-decorator';
import { browserHistory } from 'react-router';

import LoginModal from '../components/Login/Login';
import NavBar from '../components/NavBar/NavBar';
import { getCurrentUser, isAuthenticated } from '../util/auth';

import '../styles/main.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPastEvents: false,
      curUser: {},
      openLoginModal: false,
      isAuthenticated: false,
      loginFail: false,
      pathToGo: '/',
      loginModalDisable: false,
    };
  }
  async componentWillMount() {
    if (await isAuthenticated()) {
      const curUser = await getCurrentUser();
      this.setState({ isAuthenticated: true, openLoginModal: false, curUser });
    }
  }

  @autobind
  toggleFilterPastEventsTo(value) {
    this.setState({ showPastEvents: value });
  }

  @autobind
  handleLogin(curUser) {
    if (Object.keys(curUser).length > 0) {
      this.setState({ curUser, isAuthenticated: true });
    }
  }

  @autobind
  async handleAuthentication(result) {
    if (result) {
      const curUser = await getCurrentUser();
      this.setState({ isAuthenticated: true, openLoginModal: false, curUser });
      if (sessionStorage.getItem('redirectTo')) {
        browserHistory.push(sessionStorage.getItem('redirectTo'));
        sessionStorage.removeItem('redirectTo');
      }
    } else {
      sessionStorage.removeItem('redirectTo');
      this.setState({ loginFail: true });
      browserHistory.push('/');
    }
  }

  @autobind
  async handleOpenLoginModal(pathToGo) {
    if (await isAuthenticated() === false) {
      sessionStorage.setItem('redirectTo', pathToGo);
      this.setState({ openLoginModal: true, pathToGo });
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

  render() {
    const { location } = this.props;
    const { showPastEvents, curUser, openLoginModal, isAuthenticated, loginFail } = this.state;
    const childrenWithProps = React.Children.map(this.props.children,
      (child) => {
        if (child.type.displayName === 'Dashboard') {
          return cloneElement(child, {
            showPastEvents,
            curUser,
            isAuthenticated,
            cbOpenLoginModal: this.handleOpenLoginModal,
          });
        }
        if (child.type.name === 'LoginController') {
          return cloneElement(child, { handleAuthentication: this.handleAuthentication });
        }
        return cloneElement(child, {
          curUser,
          isAuthenticated,
          cbOpenLoginModal: this.handleOpenLoginModal,
        });
      });

    return (
      <div>
        <LoginModal
          open={openLoginModal}
          logFail={loginFail}
          cbCancel={this.handleCancelLoginModal}
        />
        <NavBar
          location={location}
          cbFilter={this.toggleFilterPastEventsTo}
          isAuthenticated={isAuthenticated}
          curUser={curUser}
          cbOpenLoginModal={this.handleOpenLoginModal}
        />
        <main className="main">
          {childrenWithProps}
        </main>
      </div>
    );
  }
}

App.propTypes = {
  children: React.PropTypes.element,
  location: React.PropTypes.object.isRequired,
};

export default App;
