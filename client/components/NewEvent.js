import React from 'react';
import DayPicker, { DateUtils } from 'react-day-picker';
import autobind from 'autobind-decorator';
import cssModules from 'react-css-modules';

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
      submitClass: 'waves-effect waves-light btn purple disabled',
    };
  }

  @autobind
  handleDayClick(e, day) {
    const { ranges } = this.state;
    if (!ranges[ranges.length - 1].from ||
        !ranges[ranges.length - 1].to ||
        DateUtils.isDayInRange(day, ranges[ranges.length - 1])) {
      ranges[ranges.length - 1] = DateUtils.addDayToRange(day, ranges[ranges.length - 1]);
      this.setState({ ranges });
    } else {
      ranges.push({ from: null, to: null });
      ranges[ranges.length - 1] = DateUtils.addDayToRange(day, ranges[ranges.length - 1]);
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
      const { eventName: name, ranges: dates, dateOrDay, weekDays } = this.state;
      let sentData;

      if (dateOrDay) {
        sentData = JSON.stringify({ name, weekDays });
      } else {
        sentData = JSON.stringify({ name, dates });
      }

      $.ajax({
        type: 'POST',
        url: '/api/events',
        data: sentData,
        contentType: 'application/json',
        dataType: 'json',
        success: () => window.location.replace('/dashboard'),
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
    weekDays[weekDay] = !weekDay[weekDay];
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
                  <a
                    className="btn-flat center" href="#" onClick={ this.handleResetClick }
                  >
                    Reset
                  </a>
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
                    >{ day }</a>
                  ))
                }
              </div>
              : null
            }
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
