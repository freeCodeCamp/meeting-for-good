import React, { Component } from 'react';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import autobind from 'autobind-decorator';
import _ from 'lodash';

import { checkStatus } from '../../util/fetch.util';

class ParticipantsList extends Component {
  constructor(props) {
    super(props);
    const { event, curUser } = this.props;
    this.state = {
      event: (event !== undefined) ? event : null,
      curUser,
      open: false,
      guestToDelete: '',
      deleteResult: this.props.cb,
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
      this.setState({ event: newEvent });
      this.props.cb(true);
    } catch (err) {
      console.log('deleteEvent Modal', err);
      this.props.cb(err);
      return err;
    } finally {
      this.handleClose();
    }
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
      if (participant.active === true) {
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
      }
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
    return (
      <div>
        <h6><strong>Participants</strong></h6>
        {this.renderGuestList()}
        {this.renderModal()}
      </div>

    );
  }
}

ParticipantsList.propTypes = {
  event: React.PropTypes.object,
  curUser: React.PropTypes.object,
  cb: React.PropTypes.func,
};

export default ParticipantsList;
