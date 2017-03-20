import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import FlatButton from 'material-ui/FlatButton';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import Avatar from 'material-ui/Avatar';
import RaisedButton from 'material-ui/RaisedButton';
import { browserHistory } from 'react-router';
import Toggle from 'material-ui/Toggle';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import Divider from 'material-ui/Divider';
import ArrowDown from 'material-ui/svg-icons/navigation/arrow-drop-down';

import NotificationBar from '../NotificationBar/NotificationBar';
import avatarPlaceHolder from '../../assets/Profile_avatar_placeholder_large.png';

class NavBar extends Component {
  constructor(props) {
    super(props);
    const { isAuthenticated, curUser, showPastEvents } = this.props;
    this.state = {
      userAvatar: avatarPlaceHolder,
      isAuthenticated,
      curUser,
      conditionalHomeLink: '/',
      toggleVisible: true,
      showPastEvents,

    };
  }

  componentWillMount() {
    const { location, curUser, isAuthenticated, showPastEvents } = this.props;
    this.setState({ curUser, isAuthenticated, userAvatar: curUser.Avatar, showPastEvents });
    this.MenuVisibility(location);
  }

  componentWillReceiveProps(nextProps) {
    const { location, curUser, isAuthenticated, showPastEvents } = nextProps;
    this.MenuVisibility(location);
    this.setState({ curUser, isAuthenticated, userAvatar: curUser.avatar, showPastEvents });
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
      dashButton: {
        fontSize: '15px',
        margin: 0,
        border: 0,
        color: '#ffffff',
      },
      loginButton: {
        color: '#ffffff',
        primary: true,
        fontSize: '22px',
        width: '150px',
        backgroundColor: 'transparent',
        boxShadow: '0px',
      },
      TollbarGroup: {
        paddingRight: '5%',
      },
      block: {
        maxWidth: 400,
      },
      menu: {
        iconStyle: {
          minWidth: 70,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        },
        toggle: {
          verticalAlign: 'center',
          minHeight: '100px',
          marginTop: 20,
          label: {
            fontSize: '18px',
          },
          thumbSwitched: {
            backgroundColor: 'red',
          },
        },
        itens: {
          backgroundColor: 'white',
        },
      },
    };
    const { isAuthenticated, curUser, userAvatar, showPastEvents } = this.state;

    if (isAuthenticated) {
      return (
        <ToolbarGroup
          lastChild
          style={styles.TollbarGroup}
        >
          <NotificationBar curUser={curUser} />
          {!toggleVisible ?
            <FlatButton
              style={styles.dashButton}
              onTouchTap={this.handleDashboardClick}
            >
              Dashboard
            </FlatButton>
            : null
          }
          <IconMenu
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            targetOrigin={{ horizontal: 'right', vertical: 'top' }}
            style={styles.menu}
            iconStyle={styles.menu.iconStyle}
            listStyle={styles.menu.itens}
            menuStyle={{backgroundColor: 'black' }}
            iconButtonElement={
              <IconButton style={{ paddingBottom: 55, paddingRight: 58 }}>
                <div>
                  <Avatar
                    src={userAvatar}
                  />
                  <ArrowDown style={{ fontSize: '30px', color: '#ffffff' }} />
                </div>
              </IconButton>}
          >
            <MenuItem>
              <Toggle
                label={'Past Events'}
                toggled={showPastEvents}
                style={styles.toggle}
                labelStyle={styles.menu.toggle.label}
                thumbSwitchedStyle={styles.menu.toggle.thumbSwitched}
                onToggle={this.handleFilterToggle}
              />
            </MenuItem >
            <Divider />
            <MenuItem
              href={'/api/auth/logout'}
              primaryText="Logout"
            />
          </IconMenu>
        </ToolbarGroup>
      );
    }
    return (
      <ToolbarGroup
        lastChild
        style={styles.TollbarGroup}
      >
        <RaisedButton style={styles.loginButton} backgroundColor="transparent" onTouchTap={this.handleAuthClick}>
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
  showPastEvents: React.PropTypes.bool,
};

export default NavBar;
