import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import fetch from 'isomorphic-fetch';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import NotificationsIcon from 'material-ui/svg-icons/social/notifications';
import Badge from 'material-ui/Badge';

import Divider from 'material-ui/Divider';

import { checkStatus, parseJSON } from '../../util/fetch.util';

class NotificationBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notifications: [],
      notificationColor: '#ffffff',
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
      console.log(notifications);
      this.setState({ notifications });
      this.IconButtonColor();
    } catch (err) {
      console.log('loadNotifications', err);
      return null;
    }
  }

  IconButtonColor() {
    const { notifications, curUser } = this.state;
    let notificationColor = '#ffffff';
    let quantOwnerNotNotified = 0;
    if (notifications) {
      notifications.forEach((notice) => {
        notice.participants.forEach((participant) => {
          if (participant.userId !== curUser && participant.ownerNotified === false) {
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
          if (participant.userId !== curUser) {
            let bkgColor = '#ffffff';
            if (!participant.ownerNotified) {
              bkgColor = '#EEEEFF';
            }
            const row = (
              <MenuItem
                key={participant._id}
                value={participant._id}
                style={{ backgroundColor: bkgColor, color: '#000000' }}
              >
                {`${participant.name} accept your invite for `}
                <a href={`/event/${notice._id}`}> {notice.name} </a>
              </MenuItem>
            );
            rows.push(row);
            rows.push(<Divider style={{ width: '100%' }} />);
          }
        });
      });
    }
    return rows;
  }


  render() {
    const { notificationColor, quantOwnerNotNotified } = this.state;
    const visible = (quantOwnerNotNotified === 0) ? 'hidden' : 'visible';
    return (
      <IconMenu
        maxHeight={300}
        iconButtonElement={
          <Badge
            badgeContent={quantOwnerNotNotified}
            secondary={true}
            badgeStyle={{ top: 12, right: 12, visibility: visible }}
          >
            <IconButton tooltip="Notifications" onClick={this.handleDismissAll}>
              <NotificationsIcon color={notificationColor} />
            </IconButton>
          </Badge>}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        {this.renderMenuRows()}
      </IconMenu>
    );
  }

}

export default NotificationBar;
