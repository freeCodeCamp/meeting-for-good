import React, { Component } from 'react';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import autobind from 'autobind-decorator';
import _ from 'lodash';
import { Notification } from 'react-notification';
import ContentAdd from 'material-ui/svg-icons/content/add';
import IconButton from 'material-ui/IconButton';
import cssModules from 'react-css-modules';

import { checkStatus } from '../../util/fetch.util';
import styles from './participants-list.css';
import GuestInviteDrawer from '../GuestInviteDrawer/';

class ParticipantsList extends Component {
  constructor(props) {
    super(props);
    const { event, curUser } = this.props;
    this.state = {
      event: (event !== undefined) ? event : null,
      curUser,
      open: false,
      guestToDelete: '',
      notificationMessage: '',
      notificationIsActive: false,
      notificationTitle: '',
      openDrawer: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { curUser } = nextProps;
    this.setState({ curUser });
  }

  @autobind
  handleClose() {
    this.setState({ open: false });
  }

  @autobind
  handleOpen(id) {
    this.setState({ open: true, guestToDelete: id });
  }

  @autobind
  async handleDelete() {
    const { guestToDelete, event } = this.state;
    const response =  await fetch(
    `/api/events/participant/${guestToDelete}`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'DELETE',
        credentials: 'same-origin',
      },
    );
    try {
      checkStatus(response);
      const newEvent = _.clone(event);
      newEvent.participants.forEach((participant, index) => {
        if (participant._id === guestToDelete) {
          newEvent.participants.splice(index, 1);
        }
      });
      this.setState({
        event: newEvent,
        notificationTitle: 'Alert',
        notificationIsActive: true,
        notificationMessage: 'Guest delete success!',
      });
    } catch (err) {
      this.setState({
        notificationIsActive: true,
        notificationTitle: 'Error',
        notificationMessage: 'Failed to delete guest. Please try again later.',
      });
      console.log('deleteEvent Modal', err);
      return err;
    } finally {
      this.handleClose();
    }
  }

  @autobind
  handleToggle() {
    const { openDrawer } = this.state;
    this.setState({ openDrawer: !openDrawer });
  }

  renderGuestList() {
    const styles = {
      chip: {
        margin: 4,
        width: '100%',
        border: '0.5px solid #E0E0E0',
        backgroundColor: '#ECEFF1',
      },
      wrapper: {
        display: 'flex',
        flexWrap: 'wrap',
      },
      avatar: {
        width: '40px',
        height: '40px',
      },
    };
    const { event, curUser } = this.state;
    const rows = [];
    event.participants.forEach((participant) => {
      let row;
      if (curUser._id !== participant.userId && event.owner === curUser._id) {
        row = (
          <Chip key={participant._id} style={styles.chip} onRequestDelete={() => this.handleOpen(participant._id)}>
            <Avatar src={participant.avatar} style={styles.avatar} />
            {participant.name}
          </Chip>
        );
      } else {
        row = (<Chip key={participant._id} style={styles.chip} >
          <Avatar src={participant.avatar} style={styles.avatar} />
          {participant.name}
        </Chip>
        );
      }
      rows.push(row);
    });
    return rows;
  }

  renderModal() {
    const { open } = this.state;
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label="yes"
        secondary={true}
        onTouchTap={this.handleDelete}
      />,
    ];
    const styles = {
      modal: {
        width: '35%',
        maxWidth: '35%',
      },
    };
    return (
      <Dialog
        title="Delete Guest"
        actions={actions}
        modal={true}
        open={open}
        contentStyle={styles.modal}
      >
        Are you sure you want to delete this guest?
      </Dialog>
    );
  }

  render() {
    const { event, curUser, openDrawer } = this.state;
    const inLineStyles = {
      buttonAddGuest: {
        backgroundColor: '#4A90E2',
        borderRadius: '50%',
        width: 40,
        height: 40,
        padding: 7,
        marginLeft: '80%',
        iconStyle: {
          borderRadius: '50%',
          width: 24,
          height: 24,
        },
      },
    };

    return (
      <div>
        <div styleName={'Row'}>
          <div styleName={'Column'}>
            <p styleName={'particHeader'}>
              Participants
            </p>
          </div>
          <div styleName={'Column'}>
            <IconButton
              style={inLineStyles.buttonAddGuest}
              iconStyle={inLineStyles.buttonAddGuest.iconStyle}
              onClick={this.handleToggle}
            >
              <ContentAdd />
            </IconButton >
          </div>
        </div>
        {this.renderGuestList()}
        {this.renderModal()}
        <GuestInviteDrawer open={openDrawer} event={event} curUser={curUser} />
        <Notification
          isActive={this.state.notificationIsActive}
          message={this.state.notificationMessage}
          action="Dismiss"
          title={this.state.notificationTitle}
          onDismiss={() => this.setState({ notificationIsActive: false })}
          onClick={() => this.setState({ notificationIsActive: false })}
          activeClassName="notification-bar-is-active"
        />
      </div>

    );
  }
}

ParticipantsList.propTypes = {
  event: React.PropTypes.object,
  curUser: React.PropTypes.object,
};

export default cssModules(ParticipantsList, styles);
