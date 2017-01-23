import React from 'react';
import { browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';
import { Notification } from 'react-notification';
import moment from 'moment';
import autobind from 'autobind-decorator';
import nprogress from 'nprogress';
import jsonpatch from 'fast-json-patch';
import update from 'react-addons-update';
import { connect } from 'react-redux';
import EventDetails from './EventDetailsPresentation';
import * as Actions from '../../actions';

class EventDetailsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      event: {},
      ranges: [],
      dates: [],
      user: {},
      eventParticipantsIds: [],
      myAvailability: [],
      participants: [],
      showHeatmap: false,
      notificationMessage: '',
      notificationIsActive: false,
    };
  }

  componentWillMount() {
    const { params } = this.props;
    this.props.actions.loadEvent(params.uid);
    this.props.actions.fetchCurrentUser();
  }

  componentWillReceiveProps(nextProps) {
    const { params } = this.props;
    const event = nextProps.events.find(ev => ev._id === params.uid);
    const user = nextProps.currentUser;

    if (!event || event.constructor !== Object || Object.keys(event).length === 0) {
      return;
    }

    const eventParticipantsIds = event.participants.map(participant =>
      participant.userId,
    );

    const ranges = event.dates.map(({ fromDate, toDate }) => ({
      from: new Date(fromDate),
      to: new Date(toDate),
    }));

    const dates = event.dates.map(({ fromDate, toDate }) => ({
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
    }));

    this.setState({
      event,
      eventParticipantsIds,
      ranges,
      dates,
      participants: event.participants,
    });

    if (user) {
      let showHeatmap = false;
      let myAvailability = [];

      const me = this.state.participants.find(participant =>
        participant.userId === user._id,
      );

      if (me && me.availability) {
        showHeatmap = true;
        myAvailability = me.availability;
      }

      this.setState({ user, showHeatmap, myAvailability });
    }

    if (event.participants) this.generateBestDatesAndTimes(event);
  }

  @autobind
  editAvail() {
    this.setState({ showHeatmap: false }, () => {
      document.getElementById('enterAvailButton').click();
    });
  }

  @autobind
  joinEvent() {
    const { name, avatar, _id: userId } = this.state.user;

    const participant = { name, avatar, userId };

    const event = update(this.state.event, { $set: this.state.event });
    const observerEvent = jsonpatch.observe(event);

    event.participants.push(participant);

    const eventParticipantsIds = update(this.state.eventParticipantsIds, {
      $push: [this.state.user._id],
    });

    nprogress.configure({ showSpinner: false });
    nprogress.start();

    const patches = JSON.stringify(jsonpatch.generate(observerEvent));
    this.props.actions.updateEvent(event._id, 'PATCH', patches);
    this.setState({ event, eventParticipantsIds });
  }

  @autobind
  submitAvailability(myAvailability) {
    const event = JSON.parse(JSON.stringify(this.state.event));
    const { _id } = this.props.currentUser;

    event.participants = event.participants.map((user) => {
      if (user.userId === _id) user.availability = myAvailability;
      return user;
    });

    this.props.actions.updateEvent(event._id, 'PATCH', event);

    this.setState({
      notificationIsActive: true,
      notificationMessage: 'Saved availability successfully.',
      notificationTitle: 'Success!',
      showEmail: false,
    });

    this.generateBestDatesAndTimes(event);
    this.setState({
      showHeatmap: true,
      myAvailability,
      event,
      participants: event.participants,
    });
  }

  generateBestDatesAndTimes(event) {
    const availability = [];
    const overlaps = [];
    const displayTimes = {};
    const formatStr = this.state.days ? 'dddd' : 'DD MMM';

    event.participants.forEach((user) => {
      if (user.availability !== undefined) availability.push(user.availability);
    });

    if (availability.length <= 1) return;

    for (let i = 0; i < availability[0].length; i++) {
      const current = availability[0][i];
      let count = 0;
      for (let j = 0; j < availability.length; j++) {
        for (let k = 0; k < availability[j].length; k++) {
          if (availability[j][k][0] === current[0]) {
            count += 1;
          }
        }
      }
      if (count === availability.length) overlaps.push(current);
    }


    if (overlaps.length === 0) {
      this.setState({ displayTimes });
      return;
    }

    let index = 0;
    for (let i = 0; i < overlaps.length; i++) {
      if (overlaps[i + 1] !== undefined && overlaps[i][1] !== overlaps[i + 1][0]) {
        if (displayTimes[moment(overlaps[index][0]).format(formatStr)] !== undefined) {
          displayTimes[moment(overlaps[index][0]).format(formatStr)].hours.push(
            `${moment(overlaps[index][0]).format('h:mm a')} to ${moment(overlaps[i][1]).format('h:mm a')}`,
          );
        } else {
          displayTimes[moment(overlaps[index][0]).format(formatStr)] = {
            hours: [`${moment(overlaps[index][0]).format('h:mm a')} to ${moment(overlaps[i][1]).format('h:mm a')}`],
          };
        }
        index = i + 1;
      } else if (overlaps[i + 1] === undefined) {
        if (displayTimes[moment(overlaps[index][0]).format(formatStr)] !== undefined) {
          displayTimes[moment(overlaps[index][0]).format(formatStr)].hours.push(
            `${moment(overlaps[index][0]).format('h:mm a')} to ${moment(overlaps[i][1]).format('h:mm a')}`,
          );
        } else {
          displayTimes[moment(overlaps[index][0]).format(formatStr)] = {
            hours: [`${moment(overlaps[index][0]).format('h:mm a')} to ${moment(overlaps[i][1]).format('h:mm a')}`],
          };
        }
      }
    }

    this.setState({ displayTimes });
  }

  @autobind
  deleteEvent() {
    this.props.actions.updateEvent(this.state.event._id, 'DELETE', {});
    browserHistory.push('/dashboard');
  }

  render() {
    const {
      displayTimes,
      user,
      participants,
      eventParticipantsIds,
      showHeatmap,
      dates,
      myAvailability,
      event,
    } = this.state;

    const bestTimes = displayTimes;
    let isBestTime;

    if (bestTimes !== undefined) {
      if (Object.keys(bestTimes).length > 0) isBestTime = true;
      else isBestTime = false;
    } else isBestTime = false;

    const childProps = {
      bestTimes,
      isBestTime,
      user,
      participants,
      eventParticipantsIds,
      showHeatmap,
      dates,
      myAvailability,
      event,
    };

    if (Object.keys(event).length) {
      return (
        <EventDetails
          deleteEvent={this.deleteEvent}
          joinEvent={this.joinEvent}
          submitAvailability={this.submitAvailability}
          editAvail={this.editAvail}
          {...childProps}
        />
      );
    }

    return (
      <Notification
        isActive={this.state.notificationIsActive}
        message={this.state.notificationMessage}
        action="Dismiss"
        title="Error!"
        onDismiss={() => this.setState({ notificationIsActive: false })}
        onClick={() => this.setState({ notificationIsActive: false })}
        activeClassName="notification-bar-is-active"
        dismissAfter={10000}
      />
    );
  }
}

EventDetailsContainer.propTypes = {
  params: React.PropTypes.shape({
    uid: React.PropTypes.string,
  }),
  actions: React.PropTypes.shape({
    fetchCurrentUser: React.PropTypes.func,
    loadEvent: React.PropTypes.func,
    updateEvent: React.PropTypes.func,
  }),
  currentUser: React.PropTypes.shape({
    _id: React.PropTypes.string,
  }),
};

const mapStateToProps = state => ({
  events: state.entities.events,
  currentUser: state.entities.currentUser,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(Actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(EventDetailsContainer);
