import React from 'react';
import moment from 'moment';
import autobind from 'autobind-decorator';
import fetch from 'isomorphic-fetch';
import nprogress from 'nprogress';
import { checkStatus } from '../util/fetch.util';
import { getCurrentUser } from '../util/auth';
import AvailabilityGrid from './AvailabilityGrid';

export default class AvailabilityGridContainer extends React.Component {
  static getTimesBetween(start, end) {
    let times = [start];
    let currentTime = start;

    if (moment(end).hour() === 0) {
      end = moment(end)
        .subtract(1, 'd')
        .hour(23)
        .minute(59)._d;
    }

    if (moment(end).hour() < moment(start).hour()) {
      // days are split
      currentTime = moment(start)
        .set('hour', 0)
        .set('minute', 0)._d;
      times = [currentTime];

      if (moment(end).hour() === 0) times = [];

      while (moment(end).hour() > moment(times.slice(-1)[0]).hour()) {
        currentTime = moment(currentTime).add(15, 'm')._d;
        times.push(currentTime);
      }

      currentTime = moment(currentTime)
        .set('hour', moment(start).get('hour'))
        .set('minute', moment(start).get('minute'))._d;

      times.pop();
      times.push(currentTime);

      while (moment(times.slice(-1)[0]).hour() > 0) {
        currentTime = moment(currentTime).add(15, 'm')._d;
        times.push(currentTime);
      }
    } else {
      end = moment(end).set('date', moment(start).get('date'));

      while (moment(end).isAfter(moment(times.slice(-1)[0]))) {
        currentTime = moment(currentTime).add(15, 'm')._d;
        times.push(currentTime);
      }
    }

    return times;
  }

  // Get all days between start and end.
  // eg. getDaysBetween(25th June 2016, 30th June 2016) =>
  // [25th, 26th, 27th, 28th, 29th, 30th]
  // (all input and output is in javascript Date objects)
  static getDaysBetween(start, end) {
    const dates = [start];
    let currentDay = start;

    // If the end variable's hour is 12am, then we don't want it in the allDates
    // array, or it will create an extra row in the grid made up only of disabled
    // cells.
    if (moment(end).hour() === 0) end = moment(end).subtract(1, 'd')._d;

    while (moment(end).isAfter(dates[dates.length - 1], 'day')) {
      currentDay = moment(currentDay).add(1, 'd')._d;
      dates.push(currentDay);
    }

    return dates;
  }

  constructor(props) {
    super(props);

    const dateFormatStr = 'Do MMM';

    this.state = {
      availability: [],
      allTimes: [],
      allTimesRender: [],
      allDates: [],
      allDatesRender: [],
      dateFormatStr,
      availableOnDate: [],
      notAvailableOnDate: [],
      hourTime: [],
      startCell: null,
      endCell: null,
    };
  }

  async componentWillMount() {
    const availability = [];
    const overlaps = [];
    const displayTimes = {};
    const user = await getCurrentUser();

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

  modifyHourTime(hourTime, date, i) {
    // inserts the formatted date object at the 'i+1'th index in
    // this.state.hourTime.
    this.setState({
      hourTime: [
        ...hourTime.slice(0, i + 1),
        date.format('hh:mm a'),
        ...hourTime.slice(i + 1),
      ],
    });
  }

  @autobind
  async submitAvailability() {
    const { allDates, allTimes, allDatesRender, allTimesRender } = this.state;
    const availability = [];

    $('.cell').each((i, el) => {
      if ($(el).css('background-color') === 'rgb(128, 0, 128)') {
        const timeIndex = allTimesRender.indexOf($(el).attr('data-time'));
        const dateIndex = allDatesRender.indexOf($(el).attr('data-date'));

        const date = moment(allDates[dateIndex]).get('date');

        const from = moment(allTimes[timeIndex]).set('date', date)._d;
        const to = moment(allTimes[timeIndex + 1]).set('date', date)._d;

        availability.push([from, to]);
      }
    });

    const { _id } = this.props.user;
    const event = JSON.parse(JSON.stringify(this.props.event));

    event.participants = event.participants.map((user) => {
      if (user._id === _id) user.availability = availability;
      return user;
    });

    nprogress.configure({ showSpinner: false });
    nprogress.start();
    const response = await fetch(
      `/api/events/${event._id}`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'PUT',
        body: JSON.stringify(event),
        credentials: 'same-origin',
      },
    );

    try {
      checkStatus(response);
    } catch (err) {
      console.log(err);
      return;
    } finally {
      nprogress.done();
    }

    this.props.submitAvail(availability);
  }

  render() {
    const { allDatesRender, allTimesRender, hourTime } = this.state;
    const { dates } = this.props;

    const bestTimes = this.state.displayTimes;

    let isBestTime;

    if (bestTimes !== undefined) {
      if (Object.keys(bestTimes).length > 0) isBestTime = true;
      else isBestTime = false;
    } else isBestTime = false;

    return (
      <AvailabilityGrid
        allDatesRender={allDatesRender}
        allTimeRender={allTimesRender}
        hourTime={hourTime}
        dates={dates}
        submitAvail={this.submitAvailability}
        editAvail={this.props.editAvail()}
        bestTimes={bestTimes}
        isBestTime={isBestTime}
      />
    );
  }
}

AvailabilityGridContainer.propTypes = {
  dates: React.PropTypes.array.isRequired,
  submitAvail: React.PropTypes.func,
  editAvail: React.PropTypes.func,
  myAvailability: React.PropTypes.array,
  participants: React.PropTypes.array,
  event: React.PropTypes.object,
};

