import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import autobind from 'autobind-decorator';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import EventDelete from 'material-ui/svg-icons/action/delete';
import cssModules from 'react-css-modules';
import PropTypes from 'prop-types';

import styles from './delete-modal.css';

class DeleteModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      DialogOpen: false,
      event: this.props.event,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { event } = nextProps;
    this.setState({ event });
  }

  @autobind
  handleClose() {
    this.setState({ DialogOpen: false });
  }

  @autobind
  handleOpen() {
    this.setState({ DialogOpen: true });
  }

  @autobind
  async handleDelete() {
    await this.props.cbEventDelete(this.props.event._id);
    this.handleClose();
  }

  render() {
    const { DialogOpen } = this.state;
    const styles = {
      modal: {
        title: {
          backgroundColor: '#FF4025',
          color: '#ffffff',
          fontSize: '25px',
          height: '25px',
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
      FloatingBt: {
        marginLeft: '85%',
        marginTop: '-5%',
      },
    };

    const actions = [
      <FlatButton
        label="Cancel"
        primary
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label="yes"
        secondary
        onTouchTap={this.handleDelete}
      />,
    ];
    return (
      <div>
        <FloatingActionButton
          backgroundColor="#ECEFF1"
          onTouchTap={this.handleOpen}
          styleName="delete-buttom"
          aria-label="delete-event-buttom"
        >
          <EventDelete />
        </FloatingActionButton>
        <Dialog
          title="Delete Event"
          actions={actions}
          modal
          open={DialogOpen}
          titleStyle={styles.modal.title}
          contentStyle={styles.modal.content}
          bodyStyle={styles.modal.bodyStyle}
        >
          Are you sure you want to delete the event?
        </Dialog>
      </div>
    );
  }
}

DeleteModal.propTypes = {
  cbEventDelete: PropTypes.func.isRequired,

  // Event containing list of event participants
  event: PropTypes.shape({
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
  }).isRequired,
};

export default cssModules(DeleteModal, styles);
