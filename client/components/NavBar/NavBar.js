import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import fetch from 'isomorphic-fetch';
import FlatButton from 'material-ui/FlatButton';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import Avatar from 'material-ui/Avatar';
import RaisedButton from 'material-ui/RaisedButton';
import { browserHistory } from 'react-router';
import Toggle from 'material-ui/Toggle';

import { checkStatus, parseJSON } from '../../util/fetch.util';
import { isAuthenticated } from '../../util/auth';
import NotificationBar from '../NotificationBar/NotificationBar';
import LoginModal from '../Login/Login';
import avatarPlaceHolder from '../../assets/Profile_avatar_placeholder_large.png';

class NavBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userAvatar: avatarPlaceHolder,
      user: false,
      conditionalHomeLink: '/',
      openLoginModal: false,
      toggleVisible: true,
    };
  }

  async componentWillMount() {
    await this.loadUser();
    const { location } = this.props;
    this.MenuVisibility(location);
  }

  componentWillReceiveProps(nextProps) {
    const { location } = nextProps;
    this.MenuVisibility(location);
  }

  MenuVisibility(location) {
    if (location.pathname === '/dashboard') {
      this.setState({ toggleVisible: true });
    } else {
      this.setState({ toggleVisible: false });
    }
  }

  @autobind
  handleAuthClick() {
    this.setState({ openLoginModal: true });
  }

  async loadUser() {
    if (await isAuthenticated()) {
      const response = await fetch('/api/auth/current', { credentials: 'same-origin' });
      let user;
      try {
        checkStatus(response);
        user = await parseJSON(response);
        const userAvatar = user.avatar;
        this.setState({ userAvatar, user: true, curUser: user._id, conditionalHomeLink: '/dashboard' });
      } catch (err) {
        console.log('TollBar loadUser', err);
        return null;
      }
    }
  }
  @autobind
  handleDashboardClick() {
    browserHistory.push('/dashboard');
  }

  @autobind
  handleFilterToggle(ev, isInputChecked) {
    this.props.cbFilter(isInputChecked);
  }

  renderLastGroup() {
    const { toggleVisible } = this.state;
    const styles = {
      button: {
        fontSize: '15px',
        color: '#ffffff',
        margin: 0,
      },
      loginButton: {
        color: '#ffffff',
        primary: true,
        fontSize: '25px',
        width: '150px',
      },
      TollbarGroup: {
        paddingRight: '5%',
      },
      block: {
        maxWidth: 400,
      },
      toggle: {
        marginTop: 0,
        paddingLeft: 0,
        marginRight: 4,
        label: {
          color: 'white',
          fontSize: '18px',
          width: 100,
        },
        thumbSwitched: {
          backgroundColor: 'red',
        },
      },
    };
    const { user, curUser, userAvatar, openLoginModal } = this.state;

    if (user) {
      return (
        <ToolbarGroup
          lastChild
          style={styles.TollbarGroup}
        >
          <NotificationBar curUser={curUser} />
          <div style={styles.block}>
            {toggleVisible ?
              <Toggle
                label={'Past Events'}
                style={styles.toggle}
                labelStyle={styles.toggle.label}
                thumbSwitchedStyle={styles.toggle.thumbSwitched}
                onToggle={this.handleFilterToggle}
              />
              : null
            }
          </div>
          {!toggleVisible ?
            <FlatButton
              style={styles.button}
              onTouchTap={this.handleDashboardClick}
            >
              Dashboard
          </FlatButton>
            : null
          }
          <FlatButton style={styles.button} href={'/api/auth/logout'}>
            Logout
          </FlatButton>
          <Avatar
            src={userAvatar}
          />
        </ToolbarGroup>
      );
    }
    return (
      <ToolbarGroup
        lastChild
        style={styles.TollbarGroup}
      >
        <LoginModal open={openLoginModal} />
        <RaisedButton style={styles.loginButton} backgroundColor="#006400" onTouchTap={this.handleAuthClick}>
          Login
        </RaisedButton>
      </ToolbarGroup>
    );
  }

  render() {
    const styles = {
      toolBar: {
        height: '65px',
        backgroundColor: '#006400',
      },
      button: {
        fontSize: '35px',
        color: '#ffffff',
        fontFamily: 'saxMono',
      },
    };

    return (
      <Toolbar
        style={styles.toolBar}
      >
        <ToolbarGroup
          firstChild
          style={{ paddingLeft: '2%' }}
        >
          <FlatButton
            style={styles.button}
            href={this.state.conditionalHomeLink}
          >
            Lets Meet
          </FlatButton>
        </ToolbarGroup >
        {this.renderLastGroup()}
      </Toolbar>
    );
  }
}

NavBar.propTypes = {
  location: React.PropTypes.object,
  cbFilter: React.PropTypes.func,
};

export default NavBar;
