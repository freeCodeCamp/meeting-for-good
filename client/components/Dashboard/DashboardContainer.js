import React from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../../actions';
import Dashboard from './DashboardPresentation';

class DashboardContainer extends React.PureComponent {
  componentWillMount() {
    if (sessionStorage.getItem('redirectTo')) {
      browserHistory.push(sessionStorage.getItem('redirectTo'));
      sessionStorage.removeItem('redirectTo');
    }

    this.props.actions.loadEvents();
    this.props.actions.fetchCurrentUser();
  }

  componentWillReceiveProps(nextProps) {
    const userAuth = nextProps.userAuth;

    if (userAuth !== undefined && !userAuth) {
      browserHistory.push('/');
    }
  }

  render() {
    const { events } = this.props;
    const childProps = { events };

    return (
      <Dashboard
        removeEventFromDashboard={this.removeEventFromDashboard}
        {...childProps}
      />
    );
  }
}

DashboardContainer.propTypes = {
  events: React.PropTypes.arrayOf(React.PropTypes.object),
  actions: React.PropTypes.shape({
    loadEvents: React.PropTypes.func,
    fetchCurrentUser: React.PropTypes.func,
  }),
};

const mapStateToProps = state => ({
  events: state.entities.events,
  userAuth: state.entities.userAuth,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(Actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(DashboardContainer);
