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
    const inLinestyles = {
      chip: {
        margin: 4,
        width: '100%',
        border: '0.5px solid #E0E0E0',
        backgroundColor: '#ECEFF1',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        label: {
          flexGrow: 100,
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
            style={inLinestyles.chip}
            labelStyle={inLinestyles.chip.label}
            deleteHovered
            onRequestDelete={() => this.handleOpenDeleteModal(participant._id)}
          >
            <Avatar src={participant.avatar} style={inLinestyles.avatar} />
            {participant.name}
          </Chip>
        );
      } else {
        row = (<Chip key={participant._id} style={inLinestyles.chip} >
          <Avatar src={participant.avatar} style={inLinestyles.avatar} />
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
        primary
        onTouchTap={this.handleCloseDeleteModal}
      />,
      <FlatButton
        label="yes"
        secondary
        onTouchTap={this.handleDeleteGuest}
      />,
    ];
    const inLineStyles = {
      modal: {
        title: {
          backgroundColor: '#FF4025',
          color: '#ffffff',
          fontSize: '25px',
          height: '50px',
          paddingTop: 6,
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
        titleStyle={inLineStyles.modal.title}
        contentStyle={inLineStyles.modal.content}
        bodyStyle={inLineStyles.modal.bodyStyle}
        actions={actions}
        modal
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
        backgroundColor: '#3949AB',
        borderRadius: '50%',
        width: 40,
        height: 40,
        padding: 0,
        iconStyle: {
          borderRadius: '50%',
          width: 24,
          height: 24,
          color: '#ffffff',
        },
        hoveredStyle: {
          backgroundColor: '#2DB9FF',
        },
      },
    };

    return (
      <div>
        <div styleName="headerContainer">
          <p styleName="particHeader">
            Participants
          </p>
          <IconButton
            style={inLineStyles.buttonAddGuest}
            iconStyle={inLineStyles.buttonAddGuest.iconStyle}
            onClick={this.handleToggleShowInviteGuestDrawer}
            hoveredStyle={inLineStyles.buttonAddGuest.hoveredStyle}
            tooltip="Add a participant"
            tooltipPosition="top-left"
          >
            <ContentAdd />
          </IconButton >
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
