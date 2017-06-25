import _ from 'lodash';
import autobind from 'autobind-decorator';
import cssModules from 'react-css-modules';
import DayPicker, { DateUtils } from 'react-day-picker';
import moment from 'moment';
import React from 'react';
import { browserHistory } from 'react-router';
import { Card, CardTitle, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Subheader from 'material-ui/Subheader';
import InputRange from 'react-input-range';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import EventDelete from 'material-ui/svg-icons/action/delete';
import PropTypes from 'prop-types';

import '../../styles/no-css-modules/react-input-range.css';
import { formatTime, getHours, getMinutes } from '../../util/time-format';
import dateRangeReducer from '../../util/dates.utils';
import styles from './new-event.css';

class NewEvent extends React.Component {
  static removeRange = (ranges, range) => {
    const newRange = ranges.filter(r => !_.isEqual(r, range));
    if (newRange.length === 0) {
      return [{
        from: null,
        to: null,
      }];
    }
    return newRange;
  };

  static windowsSize = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

  constructor() {
    super();
    this.state = {
      ranges: [{ from: moment().startOf('date')._d, to: moment().startOf('date')._d }],
      eventName: '',
      selectedTimeRange: [9, 17],
      disableSubmit: true,
      curUser: {},
      value4: { min: 5, max: 10 },
    };
  }

  componentWillMount() {
    const { isAuthenticated, curUser } = this.props;
    if (isAuthenticated === true) {
      this.setState({ curUser });
    } else {
      this.props.cbOpenLoginModal('/event/new');
    }
  }

  @autobind
  toggleSubmitDisabled() {
    // Checks whether the event name and dates/weekDays have been entered. If so, un-disable the
    // submit button. Otherwise, disable the submit button (if it isn't already');

    const { ranges, eventName } = this.state;

    if (ranges.length > 0 && ranges[0].from && eventName.length > 0) {
      this.setState({ disableSubmit: false });
    } else {
      this.setState({ disableSubmit: true });
    }
  }

  @autobind
  handleDayClick(day, { disabled }) {
    if (disabled) return;
    const { removeRange } = this.constructor;
    // Deep copy this.state.ranges to ranges
    let ranges = _.cloneDeep(this.state.ranges);
    let found = false;

    for (let i = 0; i < ranges.length; i += 1) {
      const range = ranges[i];
      if (DateUtils.isDayInRange(day, range)) {
        ranges = removeRange(ranges, range);
        found = true;
        break;
      }
    }
    if (!found) {
      if (ranges.length > 0 && !ranges[0].from) {
        ranges = [];
      }
      ranges.push({ from: day, to: day });
    }
    this.setState({ ranges }, () => this.toggleSubmitDisabled());
  }

  @autobind
  handleResetClick(e) {
    e.preventDefault();
    this.setState({ ranges: [{ from: null, to: null }], disableSubmit: true });
  }

  @autobind
  async createEvent() {
    const { eventName: name, ranges, selectedTimeRange: [fromTime, toTime] } = this.state;
    const fromTimeFormat = formatTime(fromTime);
    const toTimeFormat = formatTime(toTime);

    const fromHours = getHours(fromTimeFormat);
    const toHours = getHours(toTimeFormat);

    const fromMinutes = getMinutes(fromTimeFormat);
    const toMinutes = getMinutes(toTimeFormat);

    // create a date range as date
    let dates = ranges.map(({ from, to }) => {
      if (!to) to = from;
      if (from > to) [from, to] = [to, from];
      return {
        fromDate: moment(from).hour(fromHours).minute(fromMinutes).startOf('minute')._d,
        toDate: moment(to).hour(toHours).minute(toMinutes).startOf('minute')._d,
      };
    });

    dates = dateRangeReducer(dates);
    // the field active now has a default of true.
    const sentData = JSON.stringify({ name, dates });
    const newEvent = await this.props.cbNewEvent(sentData);
    browserHistory.push(`/event/${newEvent._id}`);
  }

  @autobind
  handleEventNameChange(ev) {
    this.setState({ eventName: ev.target.value }, () => this.toggleSubmitDisabled());
  }

  @autobind
  handleSnackBarRequestClose() {
    this.setState({ snackBarOpen: false });
  }

  renderDayPicker() {
    const { ranges } = this.state;
    const { windowsSize } = this.constructor;
    const { from, to } = ranges[0];
    const selectedDays = day => DateUtils.isDayInRange(day, this.state) ||
    ranges.some(v => DateUtils.isDayInRange(day, v));

    return (
      <div>
        <h6 styleName="heading-dates">What dates might work for you?</h6>
        <div styleName="reset-button">
          {from && to &&
            <FlatButton href="#reset" label="reset" onClick={this.handleResetClick} />
          }
        </div>
        <DayPicker
          numberOfMonths={windowsSize > 550 ? 2 : 1}
          fromMonth={new Date()}
          disabledDays={DateUtils.isPastDay}
          onDayClick={this.handleDayClick}
          classNames={styles}
          selectedDays={selectedDays}
        />
      </div>
    );
  }

  renderInput() {
    const { eventName } = this.state;
    return (
      <TextField
        fullWidth
        floatingLabelStyle={{ color: '#000000', fontSize: '24px' }}
        floatingLabelFocusStyle={{ color: '#26A69A' }}
        styleName="textField"
        id="event_name"
        value={eventName}
        onChange={this.handleEventNameChange}
        floatingLabelText="Event Name"
        hintText="Enter an event name..."
        className="validate"
        autoFocus
        inputStyle={{ WebkitBoxShadow: '0 0 0 1000px white inset' }}
      />
    );
  }

  renderForm() {
    const { selectedTimeRange, disableSubmit } = this.state;
    return (
      <form>
        {this.renderInput()}
        {this.renderDayPicker()}
        <Subheader styleName="subHeader">What times might work?</Subheader>
        <div styleName="rangeSelectorWrapper">
          <InputRange
            disabled={false}
            name="range"
            maxValue={24}
            minValue={0}
            formatLabel={value => formatTime(value)}
            step={0.25}
            value={{ min: selectedTimeRange[0], max: selectedTimeRange[1] }}
            onChange={value => this.setState({ selectedTimeRange: [value.min, value.max] })}
          />
        </div>
        <br />
        <Subheader styleName="subHeader">
          No earlier than {formatTime(selectedTimeRange[0])} and no later
                 than {formatTime(selectedTimeRange[1])}
        </Subheader>
        <div styleName="centerContainer">
          <RaisedButton
            labelColor="white"
            label="Create Event"
            className="submit"
            disabled={disableSubmit}
            primary
            onClick={this.createEvent}
          />
        </div>
      </form>
    );
  }

  render() {
    return (
      <div styleName="wrapper">
        <Card styleName="card">
          <FloatingActionButton
            backgroundColor="#ECEFF1"
            onTouchTap={() => browserHistory.push('/dashboard')}
            styleName="delete-buttom"
            aria-label="delete-event-buttom"
          >
            <EventDelete />
          </FloatingActionButton>
          <CardTitle styleName="cardTitle">Create a New Event</CardTitle>
          <CardText styleName="cardText">
            {this.renderForm()}
          </CardText>
        </Card>
      </div>
    );
  }
}

NewEvent.defaultProps = {
  isAuthenticated: false,
  cbOpenLoginModal: () => { console.log('cbOpenLogModal func not passed in!'); },
  cbNewEvent: () => { console.log('cbNewEvent func not passed in!'); },
};

NewEvent.propTypes = {
  isAuthenticated: PropTypes.bool,
  cbOpenLoginModal: PropTypes.func,
  cbNewEvent: PropTypes.func,

  // Current user
  curUser: PropTypes.shape({
    _id: PropTypes.string,      // Unique user id
    name: PropTypes.string,     // User name
    avatar: PropTypes.string,   // URL to image representing user(?)
  }).isRequired,

};

export default cssModules(NewEvent, styles);
