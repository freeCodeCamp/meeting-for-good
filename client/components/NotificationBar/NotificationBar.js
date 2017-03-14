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
import FlatButton from 'material-ui/FlatButton';

import { checkStatus, parseJSON } from '../../util/fetch.util';

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
    const inlineStyles = {
      flatButton: {
        paddingLeft: 0,
        paddingRight: 0,
        marginLeft: 0,
        borderLeft: 0,
        textAlign: 'left',
        label: {
          paddingLeft: 0,
          textTransform: 'none',
          marginLeft: 0,
          textAlign: 'left',
        },
      },
    };

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
                key={`${participant._id} first`}
                value={participant._id}
                style={{ backgroundColor: bkgColor }}
              >
                {`${participant.name} accept your invite for `}
                <FlatButton
                  onClick={() => this.handleEventLinkClick(notice._id)}
                  primary
                  style={inlineStyles.flatButton}
                  labelStyle={inlineStyles.flatButton.label}
                  label={notice.name}
                />
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
        top: 25,
        right: 30,
        visibility: visible,
        fontSize: '15px',
        width: 20,
        height: 20,
        iconButton: {
          paddingBottom: 50,
        },
      },
    };
    return (
      <IconMenu
        maxHeight={300}
        open={openMenu}
        iconButtonElement={
          <Badge
            badgeContent={quantOwnerNotNotified}
            secondary
            badgeStyle={inLineStyles.badge}
          >
            <IconButton
              tooltip="Notifications"
              onClick={this.handleDismissAll}
              style={inLineStyles.badge.iconButton}
            >
              <NotificationsIcon color="white" />
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
  curUser: React.PropTypes.string,
};

export default NotificationBar;
