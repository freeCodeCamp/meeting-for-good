import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

import Facebook from '../../assets/facebook.png';
import Google from '../../assets/google.png';

class LoginModal extends Component {
  constructor(props) {
    super(props);
    const { open } = this.props;
    this.state = {
      open,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { open } = nextProps;
    this.setState({ open });
  }

  @autobind
  handleClose() {
    this.setState({ open: false });
  }

  @autobind
  async handleAuthClick() {
    this.handleClose();
    if (!sessionStorage.getItem('redirectTo')) {
      sessionStorage.setItem('redirectTo', window.location.pathname);
    }
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
          fontSize: '20px',
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
          backgroundColor="#3F51B5"
          style={inLineStyles.button}
          labelStyle={inLineStyles.button.label}
          href="/api/auth/facebook"
          onClick={this.handleAuthClick}
          label="facebook"
          icon={<img src={Facebook} alt="facebook Logo" />}
        />
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

LoginModal.propTypes = {
  open: React.PropTypes.bool,
};

export default LoginModal;
