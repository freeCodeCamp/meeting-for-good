import React from 'react';
import cssModules from 'react-css-modules';
import _ from 'lodash';
import moment from 'moment';
import autobind from 'autobind-decorator';

import styles from '../styles/availability-grid.css';

class AvailabilityGrid extends React.Component {
  getDaysBetween(start, end) {
    const dates = [start];
    let currentDay = start;

    while (moment(end).isAfter(dates[dates.length - 1], 'day')) {
      currentDay = moment(currentDay).add(1, 'd')._d;
      dates.push(currentDay);
    }

    return dates;
  }

  getTimesBetween(start, end) {
    const times = [start];
    let currentTime = start;

    end = moment(end).set('d', moment(start).get('d'));

    while (times[times.length - 1] < end) {
      currentTime = moment(currentTime).add(15, 'm')._d;
      times.push(currentTime);
    }

    return times;
  }

  @autobind
  addCellToAvail(ev) {
    console.log(ev.target.getAttribute('data-time'));
    console.log(ev.target.getAttribute('data-date'));
  }

  render() {
    const allDates = _.flatten(this.props.dates.map(({ fromDate, toDate }) =>
      this.getDaysBetween(fromDate, toDate)
    ));

    const allTimes = _.flatten(this.props.dates.map(({ fromDate, toDate }) =>
      this.getTimesBetween(fromDate, toDate)
    ));

    const allDatesRender = allDates.map(date => moment(date).format('Do MMM YYYY'));
    const allTimesRender = allTimes.map(time => moment(time).format('hh:mm a'));

    return (
      <div>
        {allDatesRender.map((date, i) => (
          <div key={i} styleName="row">
            <div styleName="cell-aside">
              {date}
            </div>
            {allTimesRender.map((time, i) => (
              <div
                key={i}
                styleName="cell"
                data-time={time}
                data-date={date}
                onClick={this.addCellToAvail}
              >{time}</div>
            ))}
          </div>
        ))}
      </div>
    );
  }
}

AvailabilityGrid.propTypes = {
  dates: React.PropTypes.array.isRequired,
};

export default cssModules(AvailabilityGrid, styles);
