import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import FlatButton from 'material-ui/FlatButton';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import Avatar from 'material-ui/Avatar';
import RaisedButton from 'material-ui/RaisedButton';
import { browserHistory } from 'react-router';
import Toggle from 'material-ui/Toggle';
import cssModules from 'react-css-modules';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import Divider from 'material-ui/Divider';
import ArrowDown from 'material-ui/svg-icons/navigation/arrow-drop-down';

import NotificationBar from '../NotificationBar/NotificationBar';
import avatarPlaceHolder from '../../assets/Profile_avatar_placeholder_large.png';
import styles from './nav-bar.css';

class NavBar extends Component {

  @autobind
  static handleDashboardClick() {
    browserHistory.push('/dashboard');
  }

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
  handleFilterToggle(ev, isInputChecked) {
    sessionStorage.setItem('showPastEvents', isInputChecked);
    this.props.cbFilter(isInputChecked);
  }

  renderRightGroup() {
    const { toggleVisible } = this.state;
    const inLineStyles = {
      iconMenu: {
        iconStyle: {
          minWidth: 70,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        },
        toggle: {
          label: {
            fontSize: '18px',
          },
          thumbSwitched: {
            backgroundColor: 'red',
          },
        },
      },
      loginButton: {
        label: {
          fontWeight: 200,
          fontSize: '20px',
        },
      },
    };
    const { isAuthenticated, curUser, userAvatar, showPastEvents } = this.state;

    if (isAuthenticated) {
      return (
        <ToolbarGroup
          lastChild
          styleName="rightToolbarGroup"
        >
          <NotificationBar curUser={curUser} />
          {!toggleVisible ?
            <FlatButton
              styleName="DashButton"
              onTouchTap={this.constructor.handleDashboardClick}
            >
              Dashboard
            </FlatButton>
            : null
          }
          <IconMenu
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            targetOrigin={{ horizontal: 'right', vertical: 'top' }}
            styleName="iconMenu"
            iconStyle={inLineStyles.iconMenu.iconStyle}
            menuItemStyle={{ height: '38px' }}
            iconButtonElement={
              <IconButton style={{ padding: 0 }}>
                <div>
                  <Avatar
                    size={34}
                    src={userAvatar}
                  />
                  <ArrowDown style={{ color: '#ffffff', fontSize: '30px' }} />
                </div>
              </IconButton>}
          >
            <MenuItem
              style={{ maxHeight: '30px', minHeight: '20px' }}
            >
              <Toggle
                label={'Past Events'}
                toggled={showPastEvents}
                styleName="Toggle"
                labelStyle={inLineStyles.iconMenu.toggle.label}
                thumbSwitchedStyle={inLineStyles.iconMenu.toggle.thumbSwitched}
                onToggle={this.handleFilterToggle}
              />
            </MenuItem >
            <Divider />
            <MenuItem
              href={'/api/auth/logout'}
              primaryText="Logout"
              style={{ maxHeight: '30px', minHeight: '20px', lineHeight: '25px', textAlign: 'center' }}
            />
          </IconMenu>
        </ToolbarGroup>
      );
    }
    return (
      <ToolbarGroup
        lastChild
      >
        <RaisedButton
          styleName="loginButton"
          backgroundColor="transparent"
          onTouchTap={this.handleAuthClick}
          labelStyle={inLineStyles.loginButton.label}
        >
          Sign In
        </RaisedButton>
      </ToolbarGroup>
    );
  }

  render() {
    return (
      <Toolbar
        styleName="toolBar"
      >
        <ToolbarGroup
          firstChild
          styleName="leftToolbarGroup"
        >
          <FlatButton
            href={this.state.conditionalHomeLink}
            styleName="logoButton"
          >
            Lets Meet
          </FlatButton>
        </ToolbarGroup >
        {this.renderRightGroup()}
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

export default cssModules(NavBar, styles);
