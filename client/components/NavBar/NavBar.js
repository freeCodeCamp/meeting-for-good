import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import FlatButton from 'material-ui/FlatButton';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import Avatar from 'material-ui/Avatar';
import { browserHistory } from 'react-router';
import Toggle from 'material-ui/Toggle';
import cssModules from 'react-css-modules';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import Divider from 'material-ui/Divider';
import ArrowDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
import PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';

import NotificationBar from '../NotificationBar/NotificationBar';
import avatarPlaceHolder from '../../assets/Profile_avatar_placeholder_large.png';
import nameInitials from '../../util/string.utils';
import styles from './nav-bar.css';

class NavBar extends Component {

  @autobind
  static handleDashboardClick() {
    browserHistory.push('/dashboard');
  }

  constructor(props) {
    super(props);
    const { isAuthenticated, curUser, showPastEvents, events } = this.props;
    this.state = {
      userAvatar: avatarPlaceHolder,
      isAuthenticated,
      curUser,
      conditionalHomeLink: '/',
      toggleVisible: true,
      showPastEvents,
      events,
      openModal: false,
    };
  }

  componentWillMount() {
    const { location, curUser, isAuthenticated, showPastEvents, events } = this.props;
    this.setState({ curUser, isAuthenticated, userAvatar: curUser.Avatar, showPastEvents, events });
    this.MenuVisibility(location);
  }

  componentWillReceiveProps(nextProps) {
    const { location, curUser, isAuthenticated, showPastEvents, events } = nextProps;
    this.MenuVisibility(location);
    this.setState({ curUser, isAuthenticated, userAvatar: curUser.avatar, showPastEvents, events });
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
  handleAboutDialog() {
    this.setState({ openModal: true });
  }

  @autobind
  handleFilterToggle(ev, isInputChecked) {
    sessionStorage.setItem('showPastEvents', isInputChecked);
    this.props.cbFilter(isInputChecked);
  }

 @autobind
  HandleDismissGuest(participantId) {
    this.props.cbHandleDismissGuest(participantId);
  }

  renderAvatarMenu() {
    const { curUser, userAvatar, showPastEvents } = this.state;
    const inLineStyles = {
      iconMenu: { iconStyle: { minWidth: 70, display: 'flex', flexDirection: 'row', alignItems: 'center' },
        toggle: { label: { fontSize: '18px' }, thumbSwitched: { backgroundColor: 'red' } } } };

    return (
      <IconMenu
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
        styleName="iconMenu"
        iconStyle={inLineStyles.iconMenu.iconStyle}
        menuItemStyle={{ height: '38px', width: '168px' }}
        iconButtonElement={
          <IconButton style={{ padding: 0 }} aria-label="user button">
            <div>
              <Avatar size={34} src={userAvatar} alt={nameInitials(curUser.name)} />
              <ArrowDown style={{ color: '#ffffff', fontSize: '30px' }} />
            </div>
          </IconButton>}
      >
        <MenuItem style={{ maxHeight: '30px', minHeight: '20px' }} >
          <Toggle
            label={'Past Events'}
            toggled={showPastEvents}
            styleName="Toggle"
            labelStyle={inLineStyles.iconMenu.toggle.label}
            thumbSwitchedStyle={inLineStyles.iconMenu.toggle.thumbSwitched}
            onToggle={this.handleFilterToggle}
          />
        </MenuItem >
        <Divider styleName="Divider" />
        <MenuItem
          onClick={this.handleAboutDialog}
          styleName="AboutButton"
          primaryText="About"
          style={{ maxHeight: '30px', minHeight: '20px', lineHeight: '25px' }}
        />
        <MenuItem
          href={'/api/auth/logout'}
          styleName="LogoutButton"
          primaryText="Logout"
          style={{ maxHeight: '30px', minHeight: '20px', lineHeight: '25px' }}
        />
      </IconMenu>
    );
  }

  renderRightGroup() {
    const { toggleVisible } = this.state;
    const inLineStyles = {
      loginButton: {
        label: {
          fontWeight: 200,
          fontSize: '20px',
        },
      },
    };
    const { isAuthenticated, curUser, events } = this.state;

    if (isAuthenticated) {
      return (
        <ToolbarGroup
          lastChild
          styleName="rightToolbarGroup"
        >
          <NotificationBar
            curUser={curUser}
            events={events}
            cbHandleDismissGuest={this.HandleDismissGuest}
          />
          {!toggleVisible ?
            <FlatButton
              styleName="DashButton"
              onTouchTap={this.constructor.handleDashboardClick}
              aria-label="Dashboard"
            >
              Dashboard
            </FlatButton>
            : null
          }
          {this.renderAvatarMenu()}
        </ToolbarGroup>
      );
    }
    return (
      <ToolbarGroup
        lastChild
      >
        <FlatButton
          styleName="loginButton"
          onTouchTap={this.handleAuthClick}
          labelStyle={inLineStyles.loginButton.label}
        >
          Sign In
        </FlatButton>
      </ToolbarGroup>
    );
  }

  renderDialog() {
    const { openModal } = this.state;
    const actions = [<FlatButton label="close" primary onTouchTap={() => this.setState({ openModal: false })} />];
    const inlineStyles = {
      modal: { content: { width: '630px', maxWidth: '630px' },
        bodyStyle: { paddingTop: 10, fontSize: '25px' },
      } };
    const titleStyle = { color: 'green', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' };
    const versionStyle = { textAlign: 'center', marginBottom: '20px' };
    const descStyle = { textAlign: 'center', marginBottom: '40px' };
    const commentsStyle = { textAlign: 'center' };

    return (
      <Dialog
        contentStyle={inlineStyles.modal.content}
        bodyStyle={inlineStyles.modal.bodyStyle}
        actions={actions}
        modal
        open={openModal}
      >
        <h1 style={titleStyle}>Meeting for Good</h1>
        <h6 style={versionStyle}>Version {process.env.versionNumber}</h6>
        <h4 style={descStyle}>THE BEST MEETING COORDINATION APP</h4>
        <h6 style={commentsStyle}>Created by campers
          from <a href="https://www.freecodecamp.com">FreeCodeCamp</a></h6>
        <h6 style={commentsStyle}><a href="https://github.com/freeCodeCamp/meeting-for-good/">
          License and GitHub Repository</a></h6>
      </Dialog>
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
            aria-label="reload app"
          >
            Meeting for Good
          </FlatButton>
        </ToolbarGroup >
        {this.renderRightGroup()}
        {this.renderDialog()}
      </Toolbar>
    );
  }
}

NavBar.defaultProps = {
  isAuthenticated: false,
  showPastEvents: false,
};

NavBar.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  cbFilter: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,

  // Current user
  curUser: PropTypes.shape({
    _id: PropTypes.string,      // Unique user id
    name: PropTypes.string,     // User name
    avatar: PropTypes.string,   // URL to image representing user(?)
  }).isRequired,

  cbOpenLoginModal: PropTypes.func.isRequired,
  showPastEvents: PropTypes.bool,
  cbHandleDismissGuest: PropTypes.func.isRequired,

  // List of events containing list of event participants
  events: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
      owner: PropTypes.string,
      active: PropTypes.bool,
      selectedTimeRange: PropTypes.array,
      dates: PropTypes.arrayOf(PropTypes.shape({
        fromDate: PropTypes.string,
        toDate: PropTypes.string,
        _id: PropTypes.string,
      })),
      participants: PropTypes.arrayOf(PropTypes.shape({
        userId: PropTypes.shape({
          id: PropTypes.string,
          avatar: PropTypes.string,
          name: PropTypes.string,
          emails: PropTypes.arrayOf(PropTypes.string),
        }),
        _id: PropTypes.string,
        status: PropTypes.oneOf([0, 1, 2, 3]),
        emailUpdate: PropTypes.bool,
        ownerNotified: PropTypes.bool,
        availability: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
      })),
    }),
  ).isRequired,

};

export default cssModules(NavBar, styles);
