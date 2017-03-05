import React, { Component } from 'react';
import moment from 'moment';
import { List, ListItem } from 'material-ui/List';
import _ from 'lodash';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import Alarm from 'material-ui/svg-icons/action/alarm';
import DateRange from 'material-ui/svg-icons/action/date-range';
import DayPicker, { DateUtils } from 'react-day-picker';
import 'react-day-picker/lib/style.css';

class BestTimeDisplay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      event: this.props.event,
      curUser: this.props.curUser,
      disablePicker: false,
    };
  }

  componentWillMount() {
    this.setState({ disablePicker: false });
  }

  componentWillReceiveProps() {
    const { event, curUser, disablePicker } = this.props;
    console.log('componentWillReceiveProps', disablePicker);
    const displayTimes = this.buildBestTimes();
    //const disPicker = (disablePicker === undefined) ? 
    this.setState({ event, curUser, displayTimes, disablePicker });
  }

  buildBestTimes() {
    const { event } = this.state;
    const availability = [];
    const overlaps = [];
    const displayTimes = {};

    event.participants.forEach((participant) => {
      if (participant.availability !== undefined) availability.push(participant.availability);
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
              displayTimes[moment(overlaps[index][0]).format('DD MMM')]
                .hours.push(`${moment(overlaps[index][0]).format('h:mm a')} to ${moment(overlaps[i][1]).format('h:mm a')}`);
            } else {
              displayTimes[moment(overlaps[index][0]).format('DD MMM')] = {};
              displayTimes[moment(overlaps[index][0]).format('DD MMM')].hours = [];
              displayTimes[moment(overlaps[index][0]).format('DD MMM')]
                .hours.push(`${moment(overlaps[index][0]).format('h:mm a')} to ${moment(overlaps[i][1]).format('h:mm a')}`);
            }
            index = i + 1;
          } else if (overlaps[i + 1] === undefined) {
            if (displayTimes[moment(overlaps[index][0]).format('DD MMM')] !== undefined) {
              displayTimes[moment(overlaps[index][0]).format('DD MMM')]
                .hours.push(`${moment(overlaps[index][0]).format('h:mm a')} to ${moment(overlaps[i][1]).format('h:mm a')}`);
            } else {
              displayTimes[moment(overlaps[index][0]).format('DD MMM')] = {};
              displayTimes[moment(overlaps[index][0]).format('DD MMM')].hours = [];
              displayTimes[moment(overlaps[index][0]).format('DD MMM')]
                .hours.push(`${moment(overlaps[index][0]).format('h:mm a')} to ${moment(overlaps[i][1]).format('h:mm a')}`);
            }
          }
        }
      }
    }

    return displayTimes;
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

  renderRows(hours) {
    const styles = {
      listItem: {
        paddingLeft: 26,
        paddingTop: 0,
        paddingBottom: 0,
        color: '#000000',
      },
    };
    const rows = [];
    let key = 0;
    hours.forEach((hour) => {
      rows.push(
        <ListItem key={key} style={styles.listItem} disabled>
          {hour}
          <Divider />
        </ListItem>,
      );
      key += 1;
    });
    return rows;
  }

  renderBestTime() {
    const { displayTimes } = this.state;
    const styles = {
      listItem: {
        paddingLeft: 0,
        paddingTop: 0,
        paddingBottom: 0,
      },
      list: {
        paddingLeft: 0,
        paddingTop: 0,
        paddingBottom: 0,
      },
      subHeader: {
        paddingLeft: 0,
        paddingTop: 0,
        paddingBottom: 0,
        height: '22px',
      },
      icon: {
        marginRight: 2,
        marginTop: 2,
      },
      divider: {
        width: '100%',
      }
    };
    return Object.keys(displayTimes).map(date => (
      <List disabled style={styles.list}>
        <Subheader style={styles.subHeader}><DateRange style={styles.icon} />{date}</Subheader>
        <ListItem disabled style={styles.listItem}>
          <List>
            <Subheader style={styles.subHeader}><Alarm style={styles.icon} /> </Subheader>
            {this.renderRows(displayTimes[date].hours)}
          </List>
          <Divider style={styles.divider} />
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
        className="alt"
        styleName="day-picker"
        initialMonth={minDate}
        fromMonth={minDate}
        toMonth={maxDate}
        modifiers={modifiers}
      />
    );
  }


  render() {
    const { displayTimes, disablePicker } = this.state;
    console.log(disablePicker);
    return (
      <div>
        {this.isBestTime(displayTimes) ? this.renderBestTime() :
         (disablePicker === false) ? this.renderDayPicker() : null
        }
      </div>
    );
  }
}

BestTimeDisplay.propTypes = {
  event: React.PropTypes.object,
  curUser: React.PropTypes.object,
  disablePicker: React.PropTypes.bool,
};

export default BestTimeDisplay;

