import React, { Component } from 'react';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import autobind from 'autobind-decorator';
import ContentAdd from 'material-ui/svg-icons/content/add';
import IconButton from 'material-ui/IconButton';
import cssModules from 'react-css-modules';

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
    };
  }

  componentWillReceiveProps(nextProps) {
    const { curUser, event } = nextProps;
    this.setState({ curUser, event });
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
    const { guestToDelete } = this.state;
    const nEvent = await this.props.cbDeleteGuest(guestToDelete);
    if (nEvent) {
      this.setState({ event: nEvent });
    } else {
      console.log('error at deleteEvent Modal');
    }
    this.handleCloseDeleteModal();
  }

  @autobind
  handleToggleShowInviteGuestDrawer() {
    this.props.showInviteGuests();
  }

  renderChip(participant) {
    const { curUser, event } = this.state;
    const inLinestyles = {
      chip: {
        label: {
          flexGrow: 100,
        },
      },
    };
    let borderColor;
    let text;
    switch (participant.status) {
      case 1:
        borderColor = '3px solid #ff8080';
        text = 'invited';
        break;
      case 2:
        borderColor = '3px solid #A0C2FF';
        text = 'joined';
        break;
      case 3:
        borderColor = '0.5px solid #E0E0E0';
        text = 'time table set';
        break;
      default:
        break;
    }
    return (
    (curUser._id !== participant.userId._id && event.owner === curUser._id) ?
      <Chip
        key={participant._id}
        styleName="chip"
        labelStyle={inLinestyles.chip.label}
        onRequestDelete={() => this.handleOpenDeleteModal(participant._id)}
      >
        <Avatar
          src={participant.userId.avatar}
          styleName="avatar"
          style={{ border: borderColor }}
        />
        <div styleName="chipTextWrapper">
          <span>{participant.userId.name}</span>
          <span>{text}</span>
        </div>
      </Chip>
    :
      <Chip
        key={participant._id}
        styleName="chip"
        labelStyle={inLinestyles.chip.label}
      >
        <Avatar
          src={participant.userId.avatar}
          styleName="avatar"
          style={{ border: borderColor }}
        />
        <div styleName="chipTextWrapper">
          <span styleName="chipTextName">{participant.userId.name}</span>
          <span>{text}</span>
        </div>
      </Chip>
    );
  }

  renderGuestList() {
    const { event } = this.state;
    const rows = [];
    event.participants.forEach((participant) => {
      const row = (
        <div key={participant._id}>
          {this.renderChip(participant)}
        </div>
      );
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
          minWidth: '300px',
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
    const inLineStyles = {
      buttonAddGuest: {
        backgroundColor: '#e0e0e0',
        borderRadius: '50%',
        width: 40,
        height: 40,
        padding: 0,
        iconStyle: {
          borderRadius: '50%',
          width: 24,
          height: 24,
          color: '#FFF',
        },
        hoveredStyle: {
          backgroundColor: '#006400',
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
        <div styleName="guestsContainer">
          {this.renderGuestList()}
        </div>
        {this.renderDeleteModal()}
      </div>

    );
  }
}

ParticipantsList.propTypes = {
  event: React.PropTypes.object,
  curUser: React.PropTypes.object,
  showInviteGuests: React.PropTypes.func,
  cbDeleteGuest: React.PropTypes.func,
};

export default cssModules(ParticipantsList, styles);
