import React from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../../actions';
import Dashboard from './DashboardPresentation';
import { isAuthenticated } from '../../util/auth';

class DashboardContainer extends React.PureComponent {
  async componentWillMount() {
    if (sessionStorage.getItem('redirectTo')) {
      browserHistory.push(sessionStorage.getItem('redirectTo'));
      sessionStorage.removeItem('redirectTo');
    }

    if (!await isAuthenticated()) browserHistory.push('/');

    this.props.actions.loadEvents();
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
  }),
};

const mapStateToProps = state => ({
  events: state.entities.events,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(Actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(DashboardContainer);
