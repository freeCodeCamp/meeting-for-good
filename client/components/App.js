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
      pathToGo: '',
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
    console.log('result', result);
    const { pathToGo } = this.state;
    if (result) {
      const curUser = await getCurrentUser();
      this.setState({ isAuthenticated: true, openLoginModal: false, curUser });
      browserHistory.push(pathToGo);
    } else {
      this.setState({ loginFail: true });
    }
  }

  @autobind
  async handleOpenLoginModal(pathToGo) {
    console.log('pathToGo', pathToGo);
    if (!await isAuthenticated()) {
      this.setState({ openLoginModal: true, pathToGo });
    }
  }

  render() {
    const { location } = this.props;
    const { showPastEvents, curUser, openLoginModal, isAuthenticated, loginFail } = this.state;
    const childrenWithProps = React.Children.map(this.props.children,
      (child) => {
        console.log(this.props.children, child);
        if (this.props.children.type.displayName === 'Dashboard') {
          return cloneElement(child, {
            showPastEvents,
            curUser,
            isAuthenticated,
            cbOpenLoginModal: this.handleOpenLoginModal,
          });
        } else if (this.props.children.type.displayName === 'LoginController') {
          return cloneElement(child, { handleAuthentication: this.handleAuthentication });
        }
        return child;
      });
    return (
      <div>
        <LoginModal
          open={openLoginModal}
          logFail={loginFail}
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
