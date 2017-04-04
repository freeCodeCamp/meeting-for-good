import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import fetch from 'isomorphic-fetch';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import NotificationsIcon from 'material-ui/svg-icons/social/notifications';
import Badge from 'material-ui/Badge';
import Divider from 'material-ui/Divider';
import { browserHistory } from 'react-router';
import cssModules from 'react-css-modules';

import { checkStatus, parseJSON } from '../../util/fetch.util';
import styles from './notification-bar.css';

class NotificationBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notifications: [],
      notificationColor: '#A7A7A7',
      curUser: this.props.curUser,
      quantOwnerNotNotified: 0,
    };
  }

  async componentWillMount() {
    await this.loadNotifications();
  }

  @autobind
  async handleDismissAll() {
    const { notifications } = this.state;
    notifications.forEach((notice) => {
      notice.participants.forEach((participant) => {
        if (participant.ownerNotified === false) {
          this.handleDismiss(participant._id);
        }
      });
    });
    this.loadNotifications();
  }

  async handleDismiss(participantId) {
    const response = await fetch(`/api/events/GuestNotificationDismiss/${participantId}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      method: 'PATCH',
    });
    try {
      checkStatus(response);
    } catch (err) {
      console.log('handleDismiss', err);
    }
  }

  async loadNotifications() {
    const response = await fetch('/api/events/getGuestNotifications', { credentials: 'same-origin' });
    try {
      checkStatus(response);
      const notifications = await parseJSON(response);
      this.setState({ notifications });
      this.IconButtonColor();
    } catch (err) {
      console.log('loadNotifications', err);
      return null;
    }
  }

  @autobind
  handleEventLinkClick(id) {
    browserHistory.push(`/event/${id}`);
  }

  IconButtonColor() {
    const { notifications, curUser } = this.state;
    let notificationColor;
    let quantOwnerNotNotified = 0;
    if (notifications.length > 0) {
      notificationColor = '#ffffff';
      notifications.forEach((notice) => {
        notice.participants.forEach((participant) => {
          if (participant.userId._id.toString() !== curUser._id && participant.ownerNotified === false) {
            notificationColor = '#ff0000';
            quantOwnerNotNotified += 1;
          }
        });
      });
    }
    this.setState({ notificationColor, quantOwnerNotNotified });
  }

  renderMenuRows() {
    const { notifications, curUser } = this.state;
    const rows = [];

    if (notifications) {
      notifications.forEach((notice) => {
        notice.participants.forEach((participant) => {
          if (participant.userId !== curUser._id) {
            let bkgColor = '#ffffff';
            if (!participant.ownerNotified) {
              bkgColor = '#EEEEFF';
            }
            const row = (
              <MenuItem
                key={`${participant._id} first`}
                value={participant._id}
                style={{ backgroundColor: bkgColor }}
                styleName="menuItem"
              >
                {participant.userId.name} <span>accepted your invitation for &#32;</span>
                <a
                  onTouchTap={() => this.handleEventLinkClick(notice._id)}
                  styleName="eventLink"
                >{notice.name}</a>.
              </MenuItem>
            );
            rows.push(row);
            rows.push(<Divider key={`${participant._id} divider`} style={{ width: '100%' }} />);
          }
        });
      });
    }
    return rows;
  }

  render() {
    const { quantOwnerNotNotified, notifications } = this.state;
    const visible = (quantOwnerNotNotified === 0) ? 'hidden' : 'visible';
    const openMenu = (notifications.length === 0) ? false : null;
    const inLineStyles = {
      badge: {
        right: 47,
        top: 30,
        visibility: visible,
        fontSize: '12px',
        width: 16,
        height: 16,
      },
      iconButton: {
        icon: {
          color: 'white',
          width: '19px',
        },
      },
    };
    return (
      <IconMenu
        maxHeight={300}
        open={openMenu}
        iconStyle={inLineStyles.iconButton}
        style={{ height: '40px', width: '40px', margin: '-54px 18px 0px 0px' }}
        iconButtonElement={
          <Badge
            badgeContent={quantOwnerNotNotified}
            secondary
            badgeStyle={inLineStyles.badge}
          >
            <IconButton
              tooltip="Notifications"
              onTouchTap={this.handleDismissAll}
              iconStyle={inLineStyles.iconButton.icon}
            
            >
              <NotificationsIcon size={10} />
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
  curUser: React.PropTypes.object,
};

export default cssModules(NotificationBar, styles);
