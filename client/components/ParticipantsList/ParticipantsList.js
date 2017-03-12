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

class ParticipantsList extends Component {
  constructor(props) {
    super(props);
    const { event, curUser } = this.props;
    this.state = {
      event: (event !== undefined) ? event : null,
      curUser,
      openDeleteModal: false,
      openDrawer: false,
      guestToDelete: '',
      notificationMessage: '',
      notificationIsActive: false,
      notificationTitle: '',
    };
  }

  componentWillReceiveProps(nextProps) {
    const { curUser } = nextProps;
    this.setState({ curUser });
  }

  @autobind
  handleCloseDeleteModal() {
    this.setState({ openDeleteModal: false });
  }

  @autobind
  handleOpenDeleteModal(id) {
    this.setState({ openDeleteModal: true, guestToDelete: id });
  }

  @autobind
  async handleDeleteGuest() {
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
        notificationMessage: 'Guest delete success!' });
    } catch (err) {
      this.setState({
        notificationIsActive: true,
        notificationTitle: 'Error',
        notificationMessage: 'Failed to delete guest. Please try again later.',
      });
      console.log('error at deleteEvent Modal', err);
      return err;
    } finally {
      this.handleCloseDeleteModal();
    }
  }

  @autobind
  handleToggleShowInviteGuestDrawer() {
    this.props.showInviteGuests();
  }

  renderGuestList() {
    const styles = {
      chip: {
        margin: 4,
        width: '100%',
        border: '0.5px solid #E0E0E0',
        backgroundColor: '#ECEFF1',
        label: {
          width: '80%',
        },
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
          <Chip
            key={participant._id}
            style={styles.chip}
            labelStyle={styles.chip.label}
            onRequestDelete={() => this.handleOpenDeleteModal(participant._id)}
          >
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

  renderDeleteModal() {
    const { openDeleteModal } = this.state;
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleCloseDeleteModal}
      />,
      <FlatButton
        label="yes"
        secondary={true}
        onTouchTap={this.handleDeleteGuest}
      />,
    ];
    const styles = {
      modal: {
        title: {
          backgroundColor: '#FF4081',
          color: '#ffffff',
          fontSize: '25px',
        },
        content: {
          width: '22%',
          maxWidth: '22%',
        },
        bodyStyle: {
          paddingTop: 10,
          fontSize: '25px',
        },
      },
    };

    return (
      <Dialog
        title="Delete Guest"
        titleStyle={styles.modal.title}
        contentStyle={styles.modal.content}
        bodyStyle={styles.modal.bodyStyle}
        actions={actions}
        modal={true}
        open={openDeleteModal}
      >
        Are you sure you want to delete this guest?
      </Dialog>
    );
  }

  render() {
    const { notificationIsActive, notificationMessage, notificationTitle } = this.state;
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
        hoveredStyle: {
          backgroundColor: '#00BCD4',
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
              onClick={this.handleToggleShowInviteGuestDrawer}
              hoveredStyle={inLineStyles.buttonAddGuest.hoveredStyle}
              tooltip={'Add a participant'}
              tooltipPosition={'top-left'}
            >
              <ContentAdd />
            </IconButton >
          </div>
        </div>
        {this.renderGuestList()}
        {this.renderDeleteModal()}
        <Notification
          isActive={notificationIsActive}
          message={notificationMessage}
          action="Dismiss"
          title={notificationTitle}
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
  showInviteGuests: React.PropTypes.func,
};

export default cssModules(ParticipantsList, styles);
