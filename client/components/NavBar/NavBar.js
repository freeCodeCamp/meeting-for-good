import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import FlatButton from 'material-ui/FlatButton';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import Avatar from 'material-ui/Avatar';
import RaisedButton from 'material-ui/RaisedButton';
import { browserHistory } from 'react-router';
import Toggle from 'material-ui/Toggle';

import NotificationBar from '../NotificationBar/NotificationBar';
import avatarPlaceHolder from '../../assets/Profile_avatar_placeholder_large.png';

class NavBar extends Component {
  constructor(props) {
    super(props);
    const { isAuthenticated, curUser } = this.props;
    this.state = {
      userAvatar: avatarPlaceHolder,
      isAuthenticated,
      curUser,
      conditionalHomeLink: '/',
      toggleVisible: true,

    };
  }

  componentWillMount() {
    const { location, curUser, isAuthenticated } = this.props;
    this.setState({ curUser, isAuthenticated, userAvatar: curUser.Avatar });
    this.MenuVisibility(location);
  }

  componentWillReceiveProps(nextProps) {
    const { location, curUser, isAuthenticated } = nextProps;
    this.MenuVisibility(location);
    this.setState({ curUser, isAuthenticated, userAvatar: curUser.avatar });
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
    this.props.cbOpenLoginModal('/dashboard');
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
    const { isAuthenticated, curUser, userAvatar } = this.state;

    if (isAuthenticated) {
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
  isAuthenticated: React.PropTypes.bool,
  curUser: React.PropTypes.object,
  cbOpenLoginModal: React.PropTypes.func,
};

export default NavBar;
