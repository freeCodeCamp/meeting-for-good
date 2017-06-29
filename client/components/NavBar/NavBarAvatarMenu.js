import React from 'react';
import cssModules from 'react-css-modules';
import Avatar from 'material-ui/Avatar';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import ArrowDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
import Divider from 'material-ui/Divider';
import Toggle from 'material-ui/Toggle';
import PropTypes from 'prop-types';
import { isCurUser } from '../../util/commonPropTypes';

import nameInitials from '../../util/string.utils';
import styles from './nav-bar.css';

const inLineStyles = {
  iconMenu: {
    iconStyle: { minWidth: 70, display: 'flex', flexDirection: 'row', alignItems: 'center' },
    toggle: { label: { fontSize: '18px' }, thumbSwitched: { backgroundColor: 'red' } },
    menuItem: { maxHeight: '30px', minHeight: '30px', lineHeight: '30px', width: '168px' },
  },
};

const IconBtn = (props) => {
  const { curUser, userAvatar } = props;
  return (
    <IconButton style={{ padding: 0 }} aria-label="user button">
      <div>
        <Avatar size={34} src={userAvatar} alt={nameInitials(curUser.name)} />
        <ArrowDown style={{ color: '#ffffff', fontSize: '30px' }} />
      </div>
    </IconButton>
  );
};

const CalSetMenuItem = (props) => {
  const { cbToggleCalSetDialog } = props;
  return (
    <MenuItem
      onTouchTap={cbToggleCalSetDialog}
      styleName="AboutButton"
      primaryText="Calendar Integration"
      style={inLineStyles.iconMenu.menuItem}
    />
  );
};

const PastEventsMenuItem = (props) => {
  const { showPastEvents, handleFilterToggle } = props;
  return (
    <MenuItem style={{ maxHeight: '30px', minHeight: '30px', width: '168px' }} >
      <Toggle
        label={'Past Events'}
        toggled={showPastEvents}
        styleName="Toggle"
        labelStyle={inLineStyles.iconMenu.toggle.label}
        thumbSwitchedStyle={inLineStyles.iconMenu.toggle.thumbSwitched}
        onToggle={handleFilterToggle}
      />
    </MenuItem >
  );
};

const AboutMenuItem = (props) => {
  const { toggleAboutDialog } = props;
  return (
    <MenuItem
      onTouchTap={toggleAboutDialog}
      styleName="AboutButton"
      primaryText="About"
      style={inLineStyles.iconMenu.menuItem}
    />
  );
};

const LogoutMenuItem = () => (
  <MenuItem
    href={'/api/auth/logout'}
    styleName="LogoutButton"
    primaryText="Logout"
    style={{ maxHeight: '30px', minHeight: '30px', lineHeight: '30px', width: '168px' }}
  />
);

const MenuItems = props => (
  <span>
    {PastEventsMenuItem(props)}
    <Divider styleName="Divider" />
    {CalSetMenuItem(props)}
    {AboutMenuItem(props)}
    {LogoutMenuItem()}
  </span>
);

const AvatarMenu = props => (
  <IconMenu
    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    targetOrigin={{ horizontal: 'right', vertical: 'top' }}
    styleName="AvatarMenu"
    iconStyle={inLineStyles.iconMenu.iconStyle}
    iconButtonElement={IconBtn(props)}
    menuItemStyle={{ height: '38px', width: '168px' }}
  >
    {MenuItems(props)}
  </IconMenu>
);

IconBtn.defaultProps = {
  curUser: () => { console.log('curUser prop validation not set!'); },
};

CalSetMenuItem.propTypes = {
  cbToggleCalSetDialog: PropTypes.func.isRequired,
};

AboutMenuItem.propTypes = {
  toggleAboutDialog: PropTypes.func.isRequired,
};

IconBtn.propTypes = {
  curUser: isCurUser,
  userAvatar: PropTypes.string.isRequired,
};

PastEventsMenuItem.propTypes = {
  showPastEvents: PropTypes.bool.isRequired,
  handleFilterToggle: PropTypes.func.isRequired,
};

AboutMenuItem.propTypes = {
  toggleAboutDialog: PropTypes.func.isRequired,
};

export default cssModules(AvatarMenu, styles);
