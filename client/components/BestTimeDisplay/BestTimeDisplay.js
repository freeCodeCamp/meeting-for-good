import React, { Component } from 'react';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { ListItem } from 'material-ui/List';
import _ from 'lodash';
import DateRangeIcon from 'material-ui/svg-icons/action/date-range';
import DayPicker, { DateUtils } from 'react-day-picker';
import cssModules from 'react-css-modules';
import 'react-day-picker/lib/style.css';
import PropTypes from 'prop-types';
import jz from 'jstimezonedetect';
import Infinite from 'react-infinite';
import KeyBoardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';

import styles from './best-times-display.css';

const moment = extendMoment(Moment);

class BestTimeDisplay extends Component {

  static renderRows(hours) {
    const rows = [];
    hours.forEach((hour) => {
      const hourToShow = (
        <spam style={{ fontColor: '#000000', fontWeight: 200 }}>
          {hour}
        </spam >
      );
      const row = (
        <ListItem
          key={hour}
          disabled
          primaryText={hourToShow}
          style={{ paddingLeft: '40px' }}
          innerDivStyle={{ height: '0px', paddingTop: '0px' }}
        />
      );
      rows.push(row);
    });
    return rows;
  }

  static buildAvailabilitys(event) {
    const availabilitys = [];
    // clean the availability and tranform each avail in a range of moments with 15 min long
    // to be able to calculate the overlaps
    event.participants.forEach((participant) => {
      if (participant.availability !== undefined) {
        const availability = participant.availability.map((avail) => {
          const datesRange = moment.range([moment(avail[0]), moment(avail[1])]);
          const quartersFromDtRange = Array.from(datesRange.by('minutes', { exclusive: true, step: 15 }));
          const quartersToAvail = [];
          quartersFromDtRange.forEach(date =>
            quartersToAvail.push([moment(date), moment(date).add(15, 'm')]));
          return quartersToAvail;
        });
        availabilitys.push(_.flatten(availability));
      }
    });
    return availabilitys;
  }

  static createOverlaps(availabilitys) {
    const overlaps = [];
    if (availabilitys.length > 1) {
      // need to find the participant with less availabilitys to be the base one;
      availabilitys.sort((a, b) => a.length - b.length);
      // now calculate the overlaps
      const smallestAvail = availabilitys.splice(0, 1);
      // calculates the overlaps
      for (let i = 0; i < smallestAvail[0].length; i += 1) {
        const currentQuarter = smallestAvail[0][i];
        let count = 0;
        for (let j = 0; j < availabilitys.length; j += 1) {
          let k = 0;
          while (k < availabilitys[j].length && !currentQuarter[0].isSame(availabilitys[j][k][0])) {
            k += 1;
          }
          if (k < availabilitys[j].length) {
            count += 1;
          }
        }
        if (count === availabilitys.length) {
          overlaps.push(currentQuarter);
        }
      }
    }
    overlaps.sort((a, b) => {
      const x = a[0].clone().unix();
      const y = b[0].clone().unix();
      return x - y;
    });

    return overlaps;
  }

  static buildBestTimes(event) {
    const availabilitys = BestTimeDisplay.buildAvailabilitys(event);
    const overlaps = BestTimeDisplay.createOverlaps(availabilitys);
    const displayTimes = {};
    if (overlaps.length !== 0) {
      let index = 0;
      // for all overlaps calculated
      for (let i = 0; i < overlaps.length; i += 1) {
        const curOverlapDay = overlaps[index][0].format('DD MMM');
        const curOverlapEnd = overlaps[i][1];
        if (overlaps[i + 1] !== undefined && !curOverlapEnd.isSame(overlaps[i + 1][0])) {
          // if dosn't alreedy have that day create that day
          if (displayTimes[curOverlapDay] === undefined) {
            displayTimes[curOverlapDay] = {};
            displayTimes[curOverlapDay].hours = [];
          }
          // push the overlaped range
          displayTimes[curOverlapDay]
            .hours.push(`${overlaps[index][0].format('h:mm a')} to ${curOverlapEnd.format('h:mm a')}`);
          index = i + 1;
          // dont have a next overlap, its the last one
        } else if (overlaps[i + 1] === undefined) {
          if (displayTimes[curOverlapDay] === undefined) {
            displayTimes[curOverlapDay] = {};
            displayTimes[curOverlapDay].hours = [];
          }
          displayTimes[curOverlapDay]
            .hours.push(`${overlaps[index][0].format('h:mm a')} to ${curOverlapEnd.format('h:mm a')}`);
        }
      }
    }
    return displayTimes;
  }

  constructor(props) {
    super(props);
    this.state = {
      event: this.props.event,
      disablePicker: false,
    };
  }

  componentWillMount() {
    const { event, disablePicker } = this.props;
    const { buildBestTimes } = this.constructor;
    const displayTimes = buildBestTimes(event);
    this.setState({ event, displayTimes, disablePicker });
  }

  componentWillReceiveProps(nextProps) {
    const { event, disablePicker } = nextProps;
    const { buildBestTimes } = this.constructor;
    const displayTimes = buildBestTimes(event);
    this.setState({ event, displayTimes, disablePicker });
  }

  isBestTime() {
    const { displayTimes } = this.state;
    const bestTimes = displayTimes;
    let isBestTime;
    if (bestTimes !== undefined) {
      if (Object.keys(bestTimes).length > 0) {
        isBestTime = true;
      } else {
        isBestTime = false;
      }
    } else {
      isBestTime = false;
    }

    return isBestTime;
  }

  renderBestTime() {
    const { displayTimes } = this.state;
    return (
      Object.keys(displayTimes).map(date => (
        <ListItem
          key={date}
          style={{ height: '38px', fontSize: '18px' }}
          primaryTogglesNestedList
          leftIcon={<DateRangeIcon />}
          initiallyOpen
          primaryText={date}
          nestedListStyle={{ padding: '0px' }}
          innerDivStyle={{ padding: '16px 0px 0px 50px' }}
          nestedItems={
            this.constructor.renderRows(displayTimes[date].hours)
          }
        />
      ))
    );
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
    const containerMaxHeight = 190;
    const calcContainerHeight = () => {
      let containerHeight = 0;
      let index = 0;
      while (index < Object.keys(displayTimes).length) {
        // subtract the date row
        containerHeight += 38 + (displayTimes[Object.keys(displayTimes)[0]].hours.length * 16);
        index += 1;
      }

      return (containerHeight > containerMaxHeight) ? containerMaxHeight : containerHeight;
    };
    // Only show timezone information when we're at the dashboard.
    let tzInfo;
    if (location.pathname === '/dashboard') {
      tzInfo =
        (<div styleName="info">
          <p>
            <em>
              Displaying all times in your local timezone: {jz.determine().name()}
            </em>
          </p>
        </div>);
    } else {
      tzInfo = null;
    }

    return (
      <div styleName="bestTimeDisplay">
        {this.isBestTime(displayTimes) ?
          <div>
            {tzInfo}
            <h6 styleName="bestTimeTitle">
              The following times work for everyone:
              </h6>
            <Infinite elementHeight={39} containerHeight={calcContainerHeight()}>
              {this.renderBestTime()}
            </Infinite>
            {
              (containerMaxHeight === calcContainerHeight()) ?
                <div styleName="QuantMoreWrapper">
                  <div styleName="KeyBoardArrowDownWrapper">
                    <KeyBoardArrowDown styleName="KeyBoardArrowDown" color="#f2f2f2" />
                  </div>
                  <em> This event has {Object.keys(displayTimes).length} total possibles dates.
                      <br />
                    Scroll down for more.
                    </em>
                </div>
                : null
            }
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
