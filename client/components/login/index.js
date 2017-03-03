import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import cssModules from 'react-css-modules';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

import styles from './login.css';

class LoginModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: true,
    };
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
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleClose}
      >
      </FlatButton>,
    ];

    const styles = {
      modal: {
        width: '20%',
        maxWidth: '20%',
      },
      button: {
        marginBottom: 10,
        width: '100%',
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


    return (
      <Dialog
        title="Please login"
        actions={actions}
        modal={true}
        open={this.state.open}
        contentStyle={styles.modal}
      >
        <RaisedButton
          backgroundColor="#3F51B5"
          style={styles.button}
          labelStyle={styles.button.label}
          href="/api/auth/facebook"
          onClick={this.handleAuthClick}
          label="facebook"
          icon={<img src={require('../../assets/facebook.png')} alt="facebook Logo" />}
        />
        <RaisedButton
          backgroundColor="#F44336"
          style={styles.button}
          labelStyle={styles.button.label}
          href="/api/auth/google"
          onClick={this.handleAuthClick}
          label="Google"
          icon={<img src={require('../../assets/google.png')} alt="Google Logo" />}
        />
      </Dialog>
    );
  }
}

export default cssModules(LoginModal, styles);

LoginModal.propTypes = {
  location: React.PropTypes.object,
}
