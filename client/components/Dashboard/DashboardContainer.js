import React from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import Dashboard from './DashboardPresentation';
import { isAuthenticated } from '../../util/auth';

class DashboardContainer extends React.PureComponent {
  constructor() {
    super();
    this.state = {
      showNoScheduledMessage: false,
      notificationIsActive: false,
      notificationMessage: '',
    };
  }

  async componentWillMount() {
    if (sessionStorage.getItem('redirectTo')) {
      browserHistory.push(sessionStorage.getItem('redirectTo'));
      sessionStorage.removeItem('redirectTo');
    }

    if (!await isAuthenticated()) browserHistory.push('/');
  }

  render() {
    const { showNoScheduledMessage } = this.state;
    const { events } = this.props;
    const childProps = { showNoScheduledMessage, events };

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
};

export default connect(state => ({ events: state.events }))(DashboardContainer);
