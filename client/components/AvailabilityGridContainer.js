import React from 'react';
import cssModules from 'react-css-modules';
import _ from 'lodash';
import moment from 'moment';
import autobind from 'autobind-decorator';
import fetch from 'isomorphic-fetch';
import { checkStatus } from '../util/fetch.util';
import { getHours, getMinutes } from '../util/time-format';
import colorsys from 'colorsys';
import nprogress from 'nprogress';
import styles from '../styles/availability-grid.css';
import AvailabilityGrid from './AvailabilityGrid';

export default class AvailabilityGridContainer extends React.Component {
  constructor(props) {
    super(props);

    let dateFormatStr = 'Do MMM';

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

  getTimesBetween(start, end) {
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
  getDaysBetween(start, end) {
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

  @autobind
  editAvailability() {
    this.props.editAvail();
  }

  render() {
    const { allDatesRender, allTimesRender, hourTime } = this.state;
    const { dates } = this.props;
    return (
      <AvailabilityGrid
        allDatesRender={allDatesRender}
        allTimeRender={allTimeRender}
        hourTime={hourTime}
        dates={dates}
      />
    );
  }
}

AvailabilityGrid.propTypes = {
  dates: React.PropTypes.array.isRequired,
  heatmap: React.PropTypes.bool,
  weekDays: React.PropTypes.bool,
  user: React.PropTypes.object,
  availability: React.PropTypes.array,
  submitAvail: React.PropTypes.func,
  editAvail: React.PropTypes.func,
  myAvailability: React.PropTypes.array,
  participants: React.PropTypes.array,
  event: React.PropTypes.object,
};

