import React, { Component } from 'react';
import moment from 'moment';
import { List, ListItem } from 'material-ui/List';
import _ from 'lodash';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import DateRangeIcon from 'material-ui/svg-icons/action/date-range';
import DayPicker, { DateUtils } from 'react-day-picker';
import cssModules from 'react-css-modules';
import 'react-day-picker/lib/style.css';
import PropTypes from 'prop-types';

import styles from './best-times-display.css';

class BestTimeDisplay extends Component {

  static renderRows(hours) {
    const rows = [];
    hours.forEach((hour) => {
      const row = (
        <ListItem key={hour} styleName="RowListItem" disabled>
          {hour}
        </ListItem>
      );
      rows.push(row);
    });
    return rows;
  }

  static buildBestTimes(event) {
    const availability = [];
    const overlaps = [];
    const displayTimes = {};

    // flat availability
    event.participants.forEach((participant) => {
      if (participant.availability !== undefined && participant.availability.length > 0) {
        availability.push(participant.availability);
      }
    });
    if (availability.length > 1) {
      // need to find the participant with most availabilitys to be the base one;
      availability.sort((a, b) => b.length - a.length);
      for (let i = 0; i < availability[0].length; i += 1) {
        const current = availability[0][i];
        let count = 0;
        for (let j = 0; j < availability.length; j += 1) {
          for (let k = 0; k < availability[j].length; k += 1) {
            if (moment(availability[j][k][0]).format('D M YYYY HH mm').toString()
              === moment(current[0]).format('D M YYYY HH mm').toString()) {
              count += 1;
            }
          }
        }
        if (count === availability.length) {
          overlaps.push(current);
        }
      }
      if (overlaps.length !== 0) {
        let index = 0;
        for (let i = 0; i < overlaps.length; i += 1) {
          const date = moment(overlaps[index][0]).format('DD MMM');
          const row = `${moment(overlaps[index][0]).format('h:mm a')} to ${moment(overlaps[i][1]).format('h:mm a')}`;
          if (overlaps[i + 1] !== undefined && overlaps[i][1] !== overlaps[i + 1][0]) {
            if (displayTimes[date] !== undefined) {
              displayTimes[date].hours.push(row);
            } else {
              displayTimes[date] = {};
              displayTimes[date].hours = [];
              displayTimes[date].hours.push(row);
            }
            index = i + 1;
          } else if (overlaps[i + 1] === undefined) {
            if (displayTimes[date] !== undefined) {
              displayTimes[date].hours.push(row);
            } else {
              displayTimes[date] = {};
              displayTimes[date].hours = [];
              displayTimes[date].hours.push(row);
            }
          }
        }
      }
    }
    return displayTimes;
  }

  constructor(props) {
    super(props);
    this.state = {
      event: {},
      disablePicker: false,
    };
  }

  componentWillMount() {
    const { event, disablePicker } = this.props;
    const displayTimes = this.constructor.buildBestTimes(event);
    this.setState({ event, displayTimes, disablePicker });
  }

  componentWillReceiveProps(nextProps) {
    const { event, disablePicker } = nextProps;
    const displayTimes = this.constructor.buildBestTimes(event);
    this.setState({ event, displayTimes, disablePicker });
  }

  isBestTime() {
    const bestTimes = this.state.displayTimes;
    let isBestTime;
    if (bestTimes !== undefined) {
      if (Object.keys(bestTimes).length > 0) isBestTime = true;
      else isBestTime = false;
    } else isBestTime = false;

    return isBestTime;
  }

  renderBestTime() {
    const { displayTimes } = this.state;
    return Object.keys(displayTimes).map(date => (
      <List key={date} disabled styleName="BstTimeList">
        <Subheader styleName="SubHeader"><DateRangeIcon styleName="DateRangeIcon" />{date}</Subheader>
        <ListItem key={date} disabled styleName="BstTimeListItem">
          <List>
            {this.constructor.renderRows(displayTimes[date].hours)}
          </List>
          <Divider styleName="Divider" />
        </ListItem>
      </List>
    ));
  }

  renderDayPicker() {
    const { event } = this.state;
    let maxDate;
    let minDate;
    let modifiers;

    const ranges = event.dates.map(({ fromDate, toDate }) => ({
      from: new Date(fromDate),
      to: new Date(toDate),
    }));

    const dates = event.dates.map(({ fromDate, toDate }) => ({
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
    }));

    if (ranges) {
      modifiers = {
        selected: day =>
          DateUtils.isDayInRange(day, dates) ||
          ranges.some(v => DateUtils.isDayInRange(day, v)),
      };

      const dateInRanges = _.flatten(ranges.map(range => [range.from, range.to]));
      maxDate = new Date(Math.max.apply(null, dateInRanges));
      minDate = new Date(Math.min.apply(null, dateInRanges));
    }
    return (
      <DayPicker
        styleName="DayPicker"
        initialMonth={minDate}
        fromMonth={minDate}
        toMonth={maxDate}
        modifiers={modifiers}
      />
    );
  }

  render() {
    const { displayTimes, disablePicker } = this.state;
    return (
      <div styleName="bestTimeDisplay">
        {this.isBestTime(displayTimes) ?
          <div>
            <h6 styleName="bestTimeTitle">The following times work for everyone:</h6>
            {this.renderBestTime()}
          </div>
         :
         (disablePicker === false) ? this.renderDayPicker() : null
        }
      </div>
    );
  }
}

BestTimeDisplay.defaultProps = {
  disablePicker: false,
};

BestTimeDisplay.propTypes = {
  disablePicker: PropTypes.bool,

  // Event containing list of event participants
  event: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    owner: PropTypes.string,
    active: PropTypes.bool,
    selectedTimeRange: PropTypes.array,
    dates: PropTypes.arrayOf(PropTypes.shape({
      fromDate: PropTypes.string,
      toDate: PropTypes.string,
      _id: PropTypes.string,
    })),
    participants: PropTypes.arrayOf(PropTypes.shape({
      userId: PropTypes.shape({
        id: PropTypes.string,
        avatar: PropTypes.string,
        name: PropTypes.string,
        emails: PropTypes.arrayOf(PropTypes.string),
      }),
      _id: PropTypes.string,
      status: PropTypes.oneOf([0, 1, 2, 3]),
      emailUpdate: PropTypes.bool,
      ownerNotified: PropTypes.bool,
      availability: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    })),
  }).isRequired,
};

export default cssModules(BestTimeDisplay, styles);
