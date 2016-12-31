import React from 'react';
import autobind from 'autobind-decorator';
import Navbar from './Navbar';
import { getCurrentUser } from '../util/auth';

export default class NavbarContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userAvatar: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png',
      user: false,
      conditionalHomeLink: '/',
    };
  }

  async componentWillMount() {
    const user = await getCurrentUser();
    if (user) {
      this.setState({
        userAvatar: user.avatar,
        user: true,
        conditionalHomeLink: '/Dashboard',
      });
    }
  }

  @autobind
  handleAuthClick() {
    if (!sessionStorage.getItem('redirectTo')) {
      sessionStorage.setItem('redirectTo', this.props.location.pathname);
    }
  }

  render() {
    return (
      <Navbar
        handleAuthClick={this.handleAuthClick}
        user={this.state.user}
        userAvatar={this.state.userAvatar}
        conditionalHomeLink={this.state.conditionalHomeLink}
      />
    );
  }
}

NavbarContainer.propTypes = {
  location: React.PropTypes.shape({
    pathname: React.Proptypes.string,
  }),
};

