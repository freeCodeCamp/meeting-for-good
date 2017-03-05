import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import fetch from 'isomorphic-fetch';
import FlatButton from 'material-ui/FlatButton';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import Avatar from 'material-ui/Avatar';
import RaisedButton from 'material-ui/RaisedButton';
import { browserHistory } from 'react-router';

import { checkStatus, parseJSON } from '../../util/fetch.util';
import { isAuthenticated } from '../../util/auth';
import NotificationBar from '../../components/NotificationBar';
import LoginModal from '../Login';

class ToolBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userAvatar: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png',
      user: false,
      conditionalHomeLink: '/',
      open: false,
    };
  }

  async componentWillMount() {
    await this.loadUser();
  }

  @autobind
  handleAuthClick() {
    this.setState({ open: true });
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

  renderLastGroup() {
    const styles = {
      button: {
        fontSize: '15px',
        color: '#ffffff',
        margin: 0,
      },
      loginButton: {
        color: '#ffffff',
      },
      TollbarGroup: {
        paddingRight: '5%',

      },
    };
    const { user, curUser, userAvatar, open } = this.state;

    if (user) {
      return (
        <ToolbarGroup
          lastChild={true}
          style={styles.TollbarGroup}
        >
          <NotificationBar curUser={curUser} />
          <FlatButton
            style={styles.button}
            onTouchTap={this.handleDashboardClick}
          >
            Dashboard
          </FlatButton>
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
        lastChild={true}
        style={styles.TollbarGroup}
      >
        <LoginModal open={open} />
        <RaisedButton style={styles.loginButton} backgroundColor="#3F51B5" onTouchTap={this.handleAuthClick}>
          Login
        </RaisedButton>
      </ToolbarGroup>
    );
  }

  render() {
    const styles = {
      toolBar: {
        height: '70px',
        backgroundColor: '#006400',
      },
      button: {
        fontSize: '25px',
        color: '#ffffff',
      },
    };

    return (
      <Toolbar
        style={styles.toolBar}
      >
        <ToolbarGroup
          firstChild={true}
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

ToolBar.propTypes = {
  location: React.PropTypes.object,
};

export default ToolBar;
