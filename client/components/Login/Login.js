import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import PropTypes from 'prop-types';

import Google from '../../assets/google.png';

class LoginModal extends Component {
  constructor(props) {
    super(props);
    const { open, logFail } = this.props;
    this.state = {
      open,
      logFail,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { open, logFail } = nextProps;
    this.setState({ open, logFail });
  }

  @autobind
  handleClose() {
    this.props.cbCancel();
  }

  render() {
    const inLineStyles = {
      modal: {
        contentStyle: {
          maxWidth: '250px',
        },
        title: {
          backgroundColor: '#006400',
          marginBottom: '10px',
          fontSize: '25px',
          height: '50px',
          paddingTop: 6,
          color: '#ffffff',
        },
        bodyStyle: {
          width: '250px',
          paddingBottom: 10,
          paddingTop: 12,
        },
        actions: {
          paddingTop: 0,
        },
      },
      button: {
        marginBottom: 10,
        width: '200px',
        label: {
          color: '#ffffff',
          fontSize: '17px',
          fontFamily: 'roboto',
        },
      },
      iconStyles: {
        marginRight: 24,
      },
    };

    const actions = [
      <FlatButton
        label="Cancel"
        primary
        onTouchTap={this.handleClose}
      />,
    ];

    return (
      <Dialog
        title="Please login"
        actions={actions}
        modal
        style={inLineStyles.modal}
        titleStyle={inLineStyles.modal.title}
        open={this.state.open}
        bodyStyle={inLineStyles.modal.bodyStyle}
        actionsContainerStyle={inLineStyles.modal.actions}
        contentStyle={inLineStyles.modal.contentStyle}
      >
        <RaisedButton
          backgroundColor="#F44336"
          style={inLineStyles.button}
          labelStyle={inLineStyles.button.label}
          href="/api/auth/google"
          onClick={this.handleAuthClick}
          label="Google"
          icon={<img src={Google} alt="Google Logo" />}
        />
      </Dialog>
    );
  }
}

LoginModal.defaultProps = {
  open: false,
  logFail: false,
};

LoginModal.propTypes = {
  open: PropTypes.bool,
  logFail: PropTypes.bool,
  cbCancel: PropTypes.func.isRequired,
};

export default LoginModal;
