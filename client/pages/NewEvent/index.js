import _ from 'lodash';
import autobind from 'autobind-decorator';
import cssModules from 'react-css-modules';
import DayPicker, { DateUtils } from 'react-day-picker';
import moment from 'moment';
import noUiSlider from 'materialize-css/extras/noUiSlider/nouislider.min.js';
import React from 'react';
import fetch from 'isomorphic-fetch';
import { browserHistory } from 'react-router';
import { Notification } from 'react-notification';
import { Card, CardTitle, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Subheader from 'material-ui/Subheader';

import 'materialize-css/extras/noUiSlider/nouislider.css';
import 'react-day-picker/lib/style.css';

import { checkStatus, parseJSON } from '../../util/fetch.util';
import { formatTime, getHours, getMinutes } from '../../util/time-format';
import { isAuthenticated, getCurrentUser } from '../../util/auth';
import { dateRangeReducer } from '../../util/dates.utils';


import styles from './new-event.css';

class NewEvent extends React.Component {
  constructor() {
    super();
    this.state = {
      ranges: [{
        from: moment()
          .hour(0)
          .minute(0)
          .second(0)._d,
        to: moment()
          .hour(0)
          .minute(0)
          .second(0)._d,
      }],
      eventName: '',
      selectedTimeRange: [0, 23],
      disableSubmit: true,
      notificationIsActive: false,
      notificationMessage: '',
    };
  }

  async componentWillMount() {
    if (!await isAuthenticated()) {
      // find the current user aka possible owner
      this.state.curUser = await getCurrentUser();
      if (!sessionStorage.getItem('redirectTo')) {
        sessionStorage.setItem('redirectTo', '/event/new');
      }
      browserHistory.push('/');
    }
  }

  componentDidMount() {
    const slider = document.getElementById('timeSlider');
    noUiSlider.create(slider, {
      start: [9, 17],
      connect: true,
      step: 0.25,
      range: {
        min: 0,
        max: 24,
      },
      format: {
        to: val => formatTime(val),
        from: val => val,
      },
    });

    slider.noUiSlider.on('update', (value, handle) => {
      $('.range-label span').text('');
      const { selectedTimeRange } = this.state;
      selectedTimeRange[handle] = value[handle];
      this.setState({ selectedTimeRange });
    });

    $('.notification-bar-action').on('click', () => {
      this.setState({ notificationIsActive: false });
    });

    $('input[type="text"]+label').addClass('active');
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
  handleDayClick(e, day, { disabled }) {
    if (disabled) return;

    // date ranges manipulation
    let ranges = _.map(this.state.ranges, _.clone); // deep copy this.state.ranges to ranges
    function removeRange(ranges, range) {
      const newRange = ranges.filter(r => !_.isEqual(r, range));
      if (newRange.length === 0) {
        return [{
          from: null,
          to: null,
        }];
      }
      return newRange;
    }

    // Check if day already exists in a range. If yes, remove it from all the
    // ranges that it exists in.
    for (const range of ranges) {
      if (DateUtils.isDayInRange(day, range)) {
        const { from, to } = range;
        const yesterday = moment(day).subtract(1, 'date')._d;
        const tomorrow = moment(day).add(1, 'date')._d;

        if (!DateUtils.isDayInRange(yesterday, range) && !DateUtils.isDayInRange(tomorrow, range)) {
          ranges = removeRange(ranges, range);
          continue;
        }

        if (!moment(day).isSame(from)) {
          ranges.push({
            from, to: yesterday,
          });
        }

        if (!moment(day).isSame(to)) {
          ranges.push({
            from: tomorrow, to,
          });
        }

        ranges = removeRange(ranges, range);
      }
    }

    // If the previous operation did not change the ranges array (i.e. the
    // clicked day wasn't already in a range), then either create a new range or
    // add it to the existing range.
    if (_.isEqual(ranges, this.state.ranges)) {
      if (!ranges[ranges.length - 1].from ||
          !ranges[ranges.length - 1].to) {
        ranges[ranges.length - 1] = DateUtils.addDayToRange(day, ranges[ranges.length - 1]);
        this.setState({ ranges }, () => this.toggleSubmitDisabled());
      } else {
        ranges.push({ from: null, to: null });
        ranges[ranges.length - 1] = DateUtils.addDayToRange(day, ranges[ranges.length - 1]);
        this.setState({ ranges }, () => this.toggleSubmitDisabled());
      }
    } else {
      this.setState({ ranges }, () => this.toggleSubmitDisabled());
    }
  }

  @autobind
  handleResetClick(e) {
    e.preventDefault();
    this.setState({
      ranges: [{
        from: null,
        to: null,
      }],
      disableSubmit: true,
    });
  }

  @autobind
  async createEvent(ev) {
    const {
      eventName: name,
      ranges,
      selectedTimeRange: [fromTime, toTime],
    } = this.state;

    // validate the form
    if (ev.target.className.indexOf('disabled') > -1) {
      if (ranges.length < 0 || !ranges[0].from && name.length === 0) {
        this.setState({
          notificationIsActive: true,
          notificationMessage: 'Please select a date and enter an event name.',
        });
      } else if (ranges.length < 0 || !ranges[0].from && name.length !== 0) {
        this.setState({
          notificationIsActive: true,
          notificationMessage: 'Please select a date.',
        });
      } else if (ranges.length > 0 || ranges[0].from && name.length === 0) {
        this.setState({
          notificationIsActive: true,
          notificationMessage: 'Please enter an event name.',
        });
      }
      return;
    }

    const fromHours = getHours(fromTime);
    const toHours = getHours(toTime);

    const fromMinutes = getMinutes(fromTime);
    const toMinutes = getMinutes(toTime);
    // create a date range as date

    let dates = ranges.map(({ from, to }) => {
      if (!to) to = from;

      if (from > to) {
        [from, to] = [to, from];
      }

      return {
        fromDate: moment(from).set('h', fromHours).set('m', fromMinutes)._d,
        toDate: moment(to).set('h', toHours).set('m', toMinutes)._d,
      };
    });

    dates = dateRangeReducer(dates);
    // the field active now has a default of true.
    const sentData = JSON.stringify({ name, dates });

    const response = await fetch('/api/events', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: sentData,
      credentials: 'same-origin',
    });

    let newEvent;
    try {
      checkStatus(response);
      newEvent = await parseJSON(response);
    } catch (err) {
      console.log('err at POST NewEvent', err);
    } finally {
      browserHistory.push(`/event/${newEvent._id}`);
    }
  }

  @autobind
  handleEventNameChange(ev) {
    this.setState({ eventName: ev.target.value }, () => this.toggleSubmitDisabled());
  }

  render() {
    const { ranges, eventName, selectedTimeRange, disableSubmit, notificationIsActive, notificationMessage } = this.state;
    const inLinestyles = {
      card: {
        width: '700px',
        cardTitle: {
          textAlign: 'center',
          paddingBottom: 0,
          fontSize: '24px',
          paddingTop: 20,
          fontWeight: 300,
        },
        textField: {
          width: '100%',
          floatingLabelStyle: {
            color: '#000000',
            fontSize: '24px',
          },
          floatingLabelFocusStyle: {
            color: '#26A69A',
          },
        },
        subHeader: {
          textAlign: 'Center',
          color: '#000000',
        },
      },
    };

    const modifiers = {
      selected: day =>
        DateUtils.isDayInRange(day, this.state) ||
        ranges.some(v => DateUtils.isDayInRange(day, v)),
    };

    const { from, to } = ranges[0];

    return (
      <div styleName="card">
        <Card style={inLinestyles.card} >
          <CardTitle style={inLinestyles.card.cardTitle}>Create a New Event</CardTitle>
          <CardText>
            <form>
              <TextField
                fullWidth
                floatingLabelStyle={inLinestyles.card.textField.floatingLabelStyle}
                floatingLabelFocusStyle={inLinestyles.card.textField.floatingLabelFocusStyle}
                style={inLinestyles.card.textField}
                id="event_name"
                value={eventName}
                onChange={this.handleEventNameChange}
                floatingLabelText="Event Name"
                hintText="Enter an event name..."
                className="validate"
                autoFocus
              />
              <div>
                <h6 styleName="heading-dates">What dates might work for you?</h6>
                <div className="center" styleName="reset-button">
                  {from && to &&
                    <FlatButton
                      href="#reset"
                      label="reset"
                      onClick={this.handleResetClick}
                    />
                  }
                </div>
                <DayPicker
                  numberOfMonths={2}
                  fromMonth={new Date()}
                  disabledDays={DateUtils.isPastDay}
                  modifiers={modifiers}
                  onDayClick={this.handleDayClick}
                  styleName="daypicker"
                />
              </div>
              <Subheader style={inLinestyles.card.subHeader}>What times might work?</Subheader>
              <div id="timeSlider" />
              <br />
              <Subheader style={inLinestyles.card.subHeader}>
                No earlier than {selectedTimeRange[0]} and no later than {selectedTimeRange[1]}
              </Subheader>
              <div className="center">
                <RaisedButton
                  labelColor="#9F9F9F"
                  style={inLinestyles.card.createButton}
                  label="Create Event"
                  className="submit"
                  disabled={disableSubmit}
                  primary
                  onClick={this.createEvent}
                />
              </div>
            </form>
          </CardText>
          <Notification
            isActive={notificationIsActive}
            message={notificationMessage}
            action="Dismiss"
            title=" "
            onDismiss={() => this.setState({ notificationIsActive: false })}
            dismissAfter={10000}
            activeClassName="notification-bar-is-active"
          />
        </Card>
      </div>
    );
  }
}

export default cssModules(NewEvent, styles);
