import React from 'react';
import cssModules from 'react-css-modules';
import _ from 'lodash';
import moment from 'moment';
import autobind from 'autobind-decorator';

import styles from '../styles/availability-grid.css';

class AvailabilityGrid extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      availability: [],
      allTimes: [],
      allTimesRender: [],
      allDates: [],
      allDatesRender: [],
    };
  }

  componentWillMount() {
    const allDates = _.flatten(this.props.dates.map(({ fromDate, toDate }) =>
      this.getDaysBetween(fromDate, toDate)
    ));

    const allTimes = _.flatten(this.props.dates.map(({ fromDate, toDate }) =>
      this.getTimesBetween(fromDate, toDate)
    ));

    const allDatesRender = allDates.map(date => moment(date).format('Do MMM'));
    const allTimesRender = allTimes.map(time => moment(time).format('hh:mm a'));

    allTimesRender.pop();

    this.setState({ allDates, allTimes, allDatesRender, allTimesRender });
  }

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

    end = moment(end).set("date", moment(start).get("date"));

    while (times[times.length - 1] < end) {
      currentTime = moment(currentTime).add(15, 'm')._d;
      times.push(currentTime);
    }

    console.log(times.length)
    return times;
  }

  @autobind
  addCellToAvail(ev) {
    const { allDates, allTimes, allDatesRender, allTimesRender } = this.state;

    const timeIndex = allTimesRender.indexOf(ev.target.getAttribute('data-time'));
    const dateIndex = allDatesRender.indexOf(ev.target.getAttribute('data-date'));

    const day = moment(allDates[dateIndex]).get('d');

    const from = moment(allTimes[timeIndex]).set('d', day)._d;
    const to = moment(allTimes[timeIndex + 1]).set('d', day)._d;

    const availability = JSON.parse(JSON.stringify(this.state.availability));
    availability.push([from, to]);
    this.setState({ availability });
  }

  render() {
    const { allDatesRender, allTimesRender } = this.state;
    const hourTime = allTimesRender.filter(time => String(time).split(":")[1].split(" ")[0] === "00")

    return (
      <div>
        {hourTime.map((time,i) => {
          return (
            <p styleName="grid-hour">{time.split(" ")[0]}</p>
          )
        })}
        {allDatesRender.map((date, i) => (
          <div key={i} className="grid-row" styleName="row">
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
              ></div>
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
