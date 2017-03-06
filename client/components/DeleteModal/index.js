import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import autobind from 'autobind-decorator';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import EventDelete from 'material-ui/svg-icons/action/delete';
import fetch from 'isomorphic-fetch';
import cssModules from 'react-css-modules';

import { checkStatus } from '../../util/fetch.util';
import styles from './delete-modal.css';

class DeleteModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      event: this.props.event,
      deleteResult: this.props.cb,
    };
  }

  componentWillReceiveProps() {
    this.setState({ event: this.props.event });
  }

  @autobind
  handleClose() {
    this.setState({ open: false });
  }

  @autobind
  handleOpen() {
    this.setState({ open: true });
  }

  @autobind
  async handleDelete() {
    const response =  await fetch(
    `/api/events/${this.props.event._id}`,
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
      this.props.cb(true);
    } catch (err) {
      console.log('deleteEvent Modal', err);
      this.props.cb(err);
    } finally {
      this.handleClose();
    }
  }

  render() {
    const styles = {
      modal: {
        width: '35%',
        maxWidth: '35%',
      },
      FloatingBt: {
        marginLeft: '85%',
        marginTop: '-5%',
      },
    };

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
    return (
      <div>
        <FloatingActionButton
          secondary={true}
          onTouchTap={this.handleOpen}
          styleName={'delete-buttom'}
        >
          <EventDelete />
        </FloatingActionButton>
        <Dialog
          title="Are you sure you want to delete the event?"
          actions={actions}
          modal={true}
          open={this.state.open}
          contentStyle={styles.modal}
        />
      </div>
    );
  }
}

DeleteModal.propTypes = {
  event: React.PropTypes.object,
  cb: React.PropTypes.func,
}

export default cssModules(DeleteModal, styles);
