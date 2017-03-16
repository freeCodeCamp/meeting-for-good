import React, { Component } from 'react';

import { isAuthenticated } from '../../util/auth';

class LoginController extends Component {
  constructor(props) {
    super(props);
  }

  async componentWillMount() {
    if (await isAuthenticated()) {
      this.props.handleAuthentication(true);
    } else {
      this.props.handleAuthentication(false);
    }
  }

  render() {
    return null;
  }
}

LoginController.propTypes = {
  params: React.PropTypes.object,
  handleAuthentication: React.PropTypes.func,

};
export default LoginController;
