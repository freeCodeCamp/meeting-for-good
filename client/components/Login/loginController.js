import { Component } from 'react';
import PropTypes from 'prop-types';

import { isAuthenticated } from '../../util/auth';

class LoginController extends Component {
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
LoginController.defaultProps = {
  handleAuthentication: () => { console.log('handleAuthentication func not passed in!'); },
};

LoginController.propTypes = {
  handleAuthentication: PropTypes.func,

};
export default LoginController;
