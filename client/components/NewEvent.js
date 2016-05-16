import _ from 'lodash';
import autobind from 'autobind-decorator';
import cssModules from 'react-css-modules';
import DayPicker, { DateUtils } from 'react-day-picker';
import moment from 'moment';
import noUiSlider from 'materialize-css/extras/noUiSlider/nouislider.min.js';
import React from 'react';

import 'materialize-css/extras/noUiSlider/nouislider.css';
import 'react-day-picker/lib/style.css';
import styles from '../styles/new-event.css';

class NewEvent extends React.Component {
  constructor() {
    super();
    this.state = {
      ranges: [{ from: null, to: null }],
      eventName: null,
      weekDays: {
        mon: false,
        tue: false,
        wed: false,
        thu: false,
        fri: false,
        sat: false,
        sun: false,
      },
      dateOrDay: false,
      selectedTimeRange: [0, 23],
      submitClass: 'waves-effect waves-light btn purple disabled',
    };
  }

  componentDidMount() {
    const slider = document.getElementById('timeSlider');
    noUiSlider.create(slider, {
      start: [0, 23],
      connect: true,
      step: 1,
      range: {
        min: 0,
        max: 23,
      }, format: wNumb({
        decimals: 0,
      }),
    });

    slider.noUiSlider.on('update', (value, handle) => {
      const { selectedTimeRange } = this.state;
      selectedTimeRange[handle] = value[handle];
      this.setState({ selectedTimeRange });
    });
  }

  @autobind
  handleDayClick(e, day) {
    const ranges = Object.keys(this.state.ranges).map(i => this.state.ranges[i]);
    // Check if day already exists in a range. If yes, remove it from all the
    // ranges that it exists in.
    for (const range of ranges) {
      if (DateUtils.isDayInRange(day, range)) {
        const { from, to } = range;
        ranges.push({
          from, to: moment(day).subtract(1, 'd')._d,
        });
        ranges.push({
          from: moment(day).add(1, 'd')._d,
          to,
        });
        _.remove(ranges, r => r === range);
      }
    }

    // If the previous operation did not change the ranges array (i.e. the
    // clicked day wasn't already in a range), then either create a new range or
    // add it to the existing range.
    if (_.isEqual(ranges, this.state.ranges)) {
      if (!ranges[ranges.length - 1].from ||
          !ranges[ranges.length - 1].to) {
        ranges[ranges.length - 1] = DateUtils.addDayToRange(day, ranges[ranges.length - 1]);
        this.setState({ ranges });
      } else {
        ranges.push({ from: null, to: null });
        ranges[ranges.length - 1] = DateUtils.addDayToRange(day, ranges[ranges.length - 1]);
        this.setState({ ranges });
      }
    } else {
      this.setState({ ranges });
    }
  }

  @autobind
  handleResetClick(e) {
    e.preventDefault();
    this.setState({ ranges: [{
      from: null,
      to: null,
    }] });
  }

  @autobind
  createEvent(ev) {
    if (ev.target.className.indexOf('disabled') > -1) {
      Materialize.toast('Please enter an event name!', 4000);
    } else {
      let { eventName: name, ranges: dates, dateOrDay, weekDays, selectedTimeRange } = this.state;
      let sentData;
      let fromUTC = moment(new Date()).format("Z").split(":")[0];
      if (dateOrDay) {
        sentData = JSON.stringify({ name, weekDays, selectedTimeRange });
      } else {
        let sameDay;
        selectedTimeRange = selectedTimeRange.map(time => {
          time = Number(time) - Number(fromUTC);
          return time;
        })
        dates.forEach(function(obj){
          Object.keys(obj).map(date => {
            console.log(obj[date])
            if(obj[date] !== null){
              obj[date] = moment(obj[date]).format("YYYY-MM-DD")
              sameDay = obj[date];
            } else {
              obj[date] = sameDay;
            }
          })
        })
        sentData = JSON.stringify({ name, dates, selectedTimeRange });
      }

      $.ajax({
        type: 'POST',
        url: '/api/events',
        data: sentData,
        contentType: 'application/json',
        dataType: 'json',
        success: () => {},//window.location.replace('/dashboard'),
        error: () => Materialize.toast('An error occured. Please try again later.', 4000),
      });
    }
  }

  @autobind
  handleEventNameChange(ev) {
    this.setState({ eventName: ev.target.value });
    let { submitClass } = this.state;
    if (ev.target.value.length > 0) {
      this.setState({
        submitClass: submitClass.replace(' disabled', ''),
      });
    } else {
      if (submitClass.indexOf('disabled') === -1) {
        this.setState({
          submitClass: submitClass += ' disabled',
        });
      }
    }
  }

  @autobind
  handleWeekdaySelect(ev) {
    if (ev.target.className.indexOf('disabled') > -1) {
      ev.target.className = ev.target.className.replace('disabled', '');
    } else {
      ev.target.className += 'disabled';
    }

    const { weekDays } = this.state;
    const weekDay = ev.target.text.toLowerCase();
    weekDays[weekDay] = !weekDays[weekDay];
    this.setState({ weekDays });
  }

  @autobind
  handleDateOrDay() {
    this.setState({ dateOrDay: !this.state.dateOrDay });
  }

  render() {
    const modifiers = {
      selected: day =>
        DateUtils.isDayInRange(day, this.state) ||
        this.state.ranges.some(v => DateUtils.isDayInRange(day, v)),
    };

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const { from, to } = this.state.ranges[0];

    return (
      <div className="card" styleName="new-event-card">
        <div className="card-content">
          <span className="card-title">New Event</span>
          <form>
            <div className="row">
              <div className="input-field col s12">
                <input
                  id="event_name"
                  type="text"
                  value={ this.state.eventName }
                  onChange={ this.handleEventNameChange }
                  className="validate"
                />
                <label htmlFor="event_name">Event Name</label>
              </div>
            </div>
            <div className="switch center-align">
              <label>
                Specific Dates
                <input
                  type="checkbox"
                  onClick={ this.handleDateOrDay }
                  checked={ this.state.dateOrDay }
                />
                <span className="lever" />
                Weekdays
              </label>
            </div>
            { !this.state.dateOrDay ?
              <div>
                { from && to &&
                  <p className="center">
                    <a
                      className="btn-flat"
                      href="#"
                      onClick={ this.handleResetClick }
                    >Reset</a>
                  </p>
                }
                <DayPicker
                  fromMonth={ new Date() }
                  modifiers = { modifiers }
                  onDayClick={ this.handleDayClick }
                />
              </div>
              : null
            }
            { this.state.dateOrDay ?
              <div styleName="weekdayList">
                {
                  weekDays.map((day, index) => (
                    <a
                      key={ index }
                      className="btn-flat disabled"
                      onClick={ this.handleWeekdaySelect }
                      style={{cursor: "pointer"}}
                    >{ day }</a>
                  ))
                }
              </div>
              : null
            }
            <div id="timeSlider" />
            <br />
            <p className="center">
              From {this.state.selectedTimeRange[0]}:00 to {this.state.selectedTimeRange[1]}:00
            </p>
            <br />
            <p className="center">
              <a className={this.state.submitClass} onClick={this.createEvent}>
                Create Event
              </a>
            </p>
          </form>
        </div>
      </div>
    );
  }
}

export default cssModules(NewEvent, styles);
