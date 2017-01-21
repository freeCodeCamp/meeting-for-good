import autobind from 'autobind-decorator';
import React from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import 'materialize-css/extras/noUiSlider/nouislider.css';
import 'react-day-picker/lib/style.css';
import { isAuthenticated, getCurrentUser } from '../../util/auth';
import * as Actions from '../../actions';
import NewEvent from './NewEventPresentation';

class NewEventContainer extends React.PureComponent {
  async componentWillMount() {
    if (!await isAuthenticated()) {
      // find the current user aka possible owner
      this.state.curUser = await getCurrentUser();
      if (!sessionStorage.getItem('redirectTo')) {
        sessionStorage.setItem('redirectTo', '/event/new');
      }
      browserHistory.push('/');
    }
  }

  @autobind
  createEvent(sentData) {
    this.props.actions.newEvent(sentData);
  }

  render() {
    return (
      <NewEvent
        createEvent={this.createEvent}
      />
    );
  }
}

NewEventContainer.propTypes = {
  actions: React.PropTypes.shape({
    newEvent: React.PropTypes.func,
  }),
};

const mapStateToProps = state => ({
  currentUser: state.entities.currentUser,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(Actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(NewEventContainer);
