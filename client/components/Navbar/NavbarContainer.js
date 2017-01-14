import React from 'react';
import autobind from 'autobind-decorator';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Navbar from './NavbarPresentation';
import * as Actions from '../../actions';

class NavbarContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userAvatar: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png',
      user: false,
      conditionalHomeLink: '/',
    };
  }

  componentWillMount() {
    this.props.actions.fetchCurrentUser();
  }

  componentWillReceiveProps(nextProps) {
    const user = nextProps.currentUser;
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
    pathname: React.PropTypes.string,
  }),
  actions: React.PropTypes.shape({
    fetchCurrentUser: React.PropTypes.func,
  }),
};

const mapStateToProps = state => ({
  currentUser: state.entities.currentUser,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(Actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(NavbarContainer);
