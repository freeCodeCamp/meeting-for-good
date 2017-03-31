import _ from 'lodash';
import autobind from 'autobind-decorator';
import cssModules from 'react-css-modules';
import DayPicker, { DateUtils } from 'react-day-picker';
import moment from 'moment';
import React from 'react';
import { browserHistory } from 'react-router';
import { Notification } from 'react-notification';
import { Card, CardTitle, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Subheader from 'material-ui/Subheader';
import noUiSlider from 'materialize-css/extras/noUiSlider/nouislider.min.js';
import Snackbar from 'material-ui/Snackbar';

import 'materialize-css/extras/noUiSlider/nouislider.css';
import 'react-day-picker/lib/style.css';

import { formatTime, getHours, getMinutes } from '../../util/time-format';
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
      curUser: {},
      snackBarOpen: false,
      snackBarMsg: '',
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

  componentWillReceiveProps(nextProps) {
    const { noCurEvents } = nextProps;
    if (noCurEvents) {
      this.setState({
        snackBarOpen: true,
        snackBarMsg: 'You are redirect to New Event because you have no current scheduled events.',
      });
    }
  }

  componentWillUnmount() {
    this.props.cbNoCurEventsMsg();
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

    const newEvent = await this.props.cbNewEvent(sentData);
    browserHistory.push(`/event/${newEvent._id}`);
  }

  @autobind
  handleEventNameChange(ev) {
    this.setState({ eventName: ev.target.value }, () => this.toggleSubmitDisabled());
  }

  @autobind
  handleSnackBarRequestClose() {
    this.setState({
      snackBarOpen: false,
    });
  }

  render() {
    const {
      ranges,
      eventName, selectedTimeRange,
      disableSubmit, notificationIsActive,
      notificationMessage, snackBarOpen, snackBarMsg } = this.state;

    const inLineStyles = {
      card: {
        textField: {
          floatingLabelStyle: {
            color: '#000000',
            fontSize: '24px',
          },
          floatingLabelFocusStyle: {
            color: '#26A69A',
          },
        },
      },
      snackBar: {
        border: '5px solid #fffae6',
        contentSyle: {
          fontSize: '20px',
          width: '360px',
          lineHeight: '30px',
          textAlign: 'center',
        },
      },
    };

    const modifiers = {
      selected: day =>
        DateUtils.isDayInRange(day, this.state) ||
        ranges.some(v => DateUtils.isDayInRange(day, v)),
    };

    const { from, to } = ranges[0];
    const windowsSize = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const numOfMonthstoDisplay = windowsSize > 550 ? 2 : 1;

    return (
      <div styleName="wrapper">
        <Card styleName="card">
          <CardTitle styleName="cardTitle">Create a New Event</CardTitle>
          <CardText styleName="cardText">
            <form>
              <TextField
                fullWidth
                floatingLabelStyle={inLineStyles.card.textField.floatingLabelStyle}
                floatingLabelFocusStyle={inLineStyles.card.textField.floatingLabelFocusStyle}
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
              <div>
                <h6 styleName="heading-dates">What dates might work for you?</h6>
                <div styleName="reset-button">
                  {from && to &&
                  <FlatButton
                    href="#reset"
                    label="reset"
                    onClick={this.handleResetClick}
                  />
                  }
                </div>
                <DayPicker
                  numberOfMonths={numOfMonthstoDisplay}
                  fromMonth={new Date()}
                  disabledDays={DateUtils.isPastDay}
                  modifiers={modifiers}
                  onDayClick={this.handleDayClick}
                  styleName="daypicker"
                />
              </div>
              <Subheader styleName="subHeader">What times might work?</Subheader>
              <div id="timeSlider" />
              <br />
              <Subheader styleName="subHeader">
                No earlier than {selectedTimeRange[0]} and no later than {selectedTimeRange[1]}
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
        <Snackbar
          style={inLineStyles.snackBar}
          bodyStyle={{ height: 'flex' }}
          contentStyle={inLineStyles.snackBar.contentSyle}
          open={snackBarOpen}
          message={snackBarMsg}
          action="dismiss"
          autoHideDuration={10000}
          onRequestClose={this.handleSnackBarRequestClose}
          onActionTouchTap={this.handleSnackBarRequestClose}
        />
      </div>
    );
  }
}

NewEvent.propTypes = {
  isAuthenticated: React.PropTypes.bool,
  noCurEvents: React.PropTypes.bool,
  cbOpenLoginModal: React.PropTypes.func,
  curUser: React.PropTypes.object,
  cbNewEvent: React.PropTypes.func,
  cbNoCurEventsMsg: React.PropTypes.func,
};

export default cssModules(NewEvent, styles);
