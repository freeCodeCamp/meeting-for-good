
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


const AvatarMenu = (props) => {
  const { curUser, userAvatar, showPastEvents, handleFilterToggle, toggleAboutDialog } = props;
  const inLineStyles = {
    iconMenu: {
      iconStyle: { minWidth: 70, display: 'flex', flexDirection: 'row', alignItems: 'center' },
      toggle: { label: { fontSize: '18px' }, thumbSwitched: { backgroundColor: 'red' } },
    },
  };

  return (
    <IconMenu
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      targetOrigin={{ horizontal: 'right', vertical: 'top' }}
      styleName="AvatarMenu"
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
          onToggle={handleFilterToggle}
        />
      </MenuItem >
      <Divider styleName="Divider" />
      <MenuItem
        onClick={toggleAboutDialog}
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
};

AvatarMenu.defaultProps = {
  curUser: () => { console.log('curUser prop validation not set!'); },
};

AvatarMenu.propTypes = {
  curUser: isCurUser,
  userAvatar: PropTypes.string.isRequired,
  showPastEvents: PropTypes.bool.isRequired,
  handleFilterToggle: PropTypes.func.isRequired,
  toggleAboutDialog: PropTypes.func.isRequired,
};

export default cssModules(AvatarMenu, styles);
