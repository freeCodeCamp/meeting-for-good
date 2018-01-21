import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import NotificationsIcon from 'material-ui/svg-icons/social/notifications';
import Badge from 'material-ui/Badge';
import cssModules from 'react-css-modules';
import PropTypes from 'prop-types';
import { quantOwnerNotNotified, handleEventLinkClick } from './NotificationBarUtils';
import styles from './notification-bar.css';

class NotificationBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      events: this.props.events,
      curUser: this.props.curUser,
      notificationColor: '#ff0000',
      quantOwnerNotNotified: 0,
      openMenu: false,
    };
  }

  componentWillMount() {
    const { events, curUser } = this.props;
    this.setState({
      events, curUser, quantOwnerNotNotified: quantOwnerNotNotified(events, curUser),
    });
  }

  componentWillReceiveProps(nextProps) {
    const { events } = nextProps;
    const { curUser } = this.props;
    this.setState({ events, quantOwnerNotNotified: quantOwnerNotNotified(events, curUser) });
  }

  @autobind
  async handleDismissAll() {
    const { events } = this.state;
    const { cbHandleDismissGuest } = this.props;
    const guestDismissList = [];
    events.forEach((event) => {
      event.participants.forEach((participant) => {
        if (participant.ownerNotified === false && participant.status > 1) {
          guestDismissList.push(participant._id);
        }
      });
    });
    try {
      await cbHandleDismissGuest(guestDismissList);
    } catch (err) {
      console.log('error at handleDismissAll NoficationBar', err);
    }
  }

  @autobind
  async handleOnRequestChange(open) {
    if (!open) {
      await this.handleDismissAll();
    }
    this.setState({ openMenu: open });
  }

  @autobind
  handleOpenMenu() {
    this.setState({ openMenu: true });
  }

  renderMenuRows() {
    const noNotificationsRow = <MenuItem disabled>No new notifications</MenuItem>;
    const { events, curUser } = this.state;
    if (!events) {
      return noNotificationsRow;
    }
    const rows = [];
    const filtEvent = events.filter(event => event.owner.toString() === curUser._id);
    filtEvent.forEach((event) => {
      event.participants.forEach((participant) => {
        if (participant.userId._id !== curUser._id && participant.status > 1) {
          const bkgColor = (!participant.ownerNotified) ? '#EEEEFF' : '#ffffff';
          const row = (
            <MenuItem
              key={`${participant._id} first`}
              value={participant._id}
              style={{ backgroundColor: bkgColor }}
              styleName="menuItem"
            >
              {participant.userId.name} <span>accepted your invitation to &#32;</span>
              <a
                onTouchTap={() => handleEventLinkClick(event._id)}
                styleName="eventLink"
              >{event.name}
              </a>.
            </MenuItem>
          );
          rows.push(row);
        }
      });
    });
    if (!rows.length) {
      return noNotificationsRow;
    }
    return rows;
  }

  render() {
    const { quantOwnerNotNotified, openMenu } = this.state;
    const visible = (quantOwnerNotNotified === 0) ? 'hidden' : 'visible';
    const inLineStyles = {
      badge: {
        right: 3, top: 2, visibility: visible, fontSize: '12px', width: 16, height: 16,
      },
      iconButton: { height: '40px', icon: { color: 'white', width: '19px' } },
    };
    return (
      <IconMenu
        maxHeight={300}
        onRequestChange={this.handleOnRequestChange}
        onTouchTap={this.handleOpenMenu}
        open={openMenu}
        useLayerForClickAway
        iconButtonElement={
          <Badge styleName="badge" badgeContent={quantOwnerNotNotified} secondary badgeStyle={inLineStyles.badge} >
            <IconButton tooltip="Notifications" style={inLineStyles.iconButton} iconStyle={inLineStyles.iconButton.icon}>
              <NotificationsIcon />
            </IconButton>
          </Badge>
        }
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        {this.renderMenuRows()}
      </IconMenu >
    );
  }
}

NotificationBar.propTypes = {
  // Currrent user
  curUser: PropTypes.shape({
    _id: PropTypes.string, // Unique user id
    name: PropTypes.string, // User name
    avatar: PropTypes.string, // URL to image representing user(?)
  }).isRequired,

  cbHandleDismissGuest: PropTypes.func.isRequired,

  // List of events containing list of event participants
  events: PropTypes.arrayOf(PropTypes.shape({
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
  })).isRequired,
};

export default cssModules(NotificationBar, styles);
