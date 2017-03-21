import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import autobind from 'autobind-decorator';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import EventDelete from 'material-ui/svg-icons/action/delete';
import cssModules from 'react-css-modules';

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
          backgroundColor="#BDBDBD"
          onTouchTap={this.handleOpen}
          styleName="delete-buttom"
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
  event: React.PropTypes.object,
  cbEventDelete: React.PropTypes.func,
};

export default cssModules(DeleteModal, styles);
