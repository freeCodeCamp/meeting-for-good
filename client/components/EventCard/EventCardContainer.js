import React from 'react';
import { DateUtils } from 'react-day-picker';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import autobind from 'autobind-decorator';
import _ from 'lodash';
import moment from 'moment';
import 'react-day-picker/lib/style.css';
import * as Actions from '../../actions/';
import EventCard from './EventCardPresentation';

class EventCardContainer extends React.Component {
  constructor(props) {
    super(props);

    const { event } = props;

    const ranges = event.dates.map(({ fromDate, toDate }) => ({
      from: new Date(fromDate),
      to: new Date(toDate),
    }));

    const dates = event.dates.map(({ fromDate, toDate }) => ({
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
    }));

    this.state = {
      participants: event.participants,
      ranges,
      dates,
      event,
      user: {},
      notificationMessage: '',
      notificationIsActive: false,
    };
  }

  componentWillMount() {
    this.props.actions.fetchCurrentUser();
  }

  componentWillReceiveProps(nextProps) {
    const availability = [];
    const overlaps = [];
    const displayTimes = {};
    const { currentUser: user, userAuth } = nextProps;
    if (!userAuth || !Object.keys(user).length) return;

    this.state.participants.forEach((user) => {
      if (user.availability !== undefined) availability.push(user.availability);
    });

    if (availability.length > 1) {
      for (let i = 0; i < availability[0].length; i += 1) {
        const current = availability[0][i];
        let count = 0;
        for (let j = 0; j < availability.length; j++) {
          for (let k = 0; k < availability[j].length; k += 1) {
            if (availability[j][k][0] === current[0]) {
              count += 1;
            }
          }
        }
        if (count === availability.length) overlaps.push(current);
      }

      if (overlaps.length !== 0) {
        let index = 0;
        for (let i = 0; i < overlaps.length; i++) {
          if (overlaps[i + 1] !== undefined && overlaps[i][1] !== overlaps[i + 1][0]) {
            if (displayTimes[moment(overlaps[index][0]).format('DD MMM')] !== undefined) {
              displayTimes[moment(overlaps[index][0]).format('DD MMM')].hours.push(`${moment(overlaps[index][0]).format('h:mm a')} to ${moment(overlaps[i][1]).format('h:mm a')}`);
            } else {
              displayTimes[moment(overlaps[index][0]).format('DD MMM')] = {};
              displayTimes[moment(overlaps[index][0]).format('DD MMM')].hours = [];
              displayTimes[moment(overlaps[index][0]).format('DD MMM')].hours.push(`${moment(overlaps[index][0]).format('h:mm a')} to ${moment(overlaps[i][1]).format('h:mm a')}`);
            }
            index = i + 1;
          } else if (overlaps[i + 1] === undefined) {
            if (displayTimes[moment(overlaps[index][0]).format('DD MMM')] !== undefined) {
              displayTimes[moment(overlaps[index][0]).format('DD MMM')].hours.push(`${moment(overlaps[index][0]).format('h:mm a')} to ${moment(overlaps[i][1]).format('h:mm a')}`);
            } else {
              displayTimes[moment(overlaps[index][0]).format('DD MMM')] = {};
              displayTimes[moment(overlaps[index][0]).format('DD MMM')].hours = [];
              displayTimes[moment(overlaps[index][0]).format('DD MMM')].hours.push(`${moment(overlaps[index][0]).format('h:mm a')} to ${moment(overlaps[i][1]).format('h:mm a')}`);
            }
          }
        }
      }
    }

    this.setState({ displayTimes, user });
  }

  @autobind
  deleteEvent() {
    this.props.actions.deleteEvent(this.state.event._id);
    // this.props.removeEventFromDashboard(this.state.event._id);
  }

  render() {
    const { event, user, ranges, displayTimes } = this.state;
    let isOwner;
    let modifiers;

    if (user !== undefined) {
      isOwner = event.owner === user._id;
    }

  // Get maximum and minimum month from the selected dates to limit the
  // daypicker to those months
    let maxDate;
    let minDate;

    if (ranges) {
      modifiers = {
        selected: day =>
          DateUtils.isDayInRange(day, this.state) ||
          ranges.some(v => DateUtils.isDayInRange(day, v)),
      };

      const dateInRanges = _.flatten(ranges.map(range =>
        [range.from, range.to],
      ));

      maxDate = new Date(Math.max.apply(null, dateInRanges));
      minDate = new Date(Math.min.apply(null, dateInRanges));
    }

    const bestTimes = displayTimes;
    let isBestTime;

    if (bestTimes !== undefined && Object.keys(bestTimes).length > 0) {
      isBestTime = true;
    } else isBestTime = false;

    return (
      <EventCard
        event={event}
        isOwner={isOwner}
        user={user}
        ranges={ranges}
        isBestTime={isBestTime}
        bestTimes={bestTimes}
        modifiers={modifiers}
        maxDate={maxDate}
        minDate={minDate}
        deleteEvent={this.deleteEvent}
      />
    );
  }
}

EventCardContainer.propTypes = {
  event: React.PropTypes.object,
  removeEventFromDashboard: React.PropTypes.func,
  actions: React.PropTypes.shape({
    updateEvent: React.PropTypes.func,
    fetchCurrentUser: React.PropTypes.func,
    deleteEvent: React.PropTypes.func,
  }),
};

const mapStateToProps = state => ({
  currentUser: state.entities.currentUser,
  userAuth: state.entities.userAuth,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(Actions, dispatch),
});
export default connect(mapStateToProps, mapDispatchToProps)(EventCardContainer);
