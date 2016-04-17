import React from 'react';
import DayPicker, { DateUtils } from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import autobind from 'autobind-decorator';

export default class NewMeeting extends React.Component {
  constructor() {
    super();
    this.state = {
      ranges: [{ from: null, to: null }],
      meetingName: null,
      weekDays: {
        mon: false,
        tue: false,
        wed: false,
        thu: false,
        fri: false,
        sat: false,
        sun: false
      },
      dateOrDay: false,
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
  createMeeting() {
    const { meetingName: name, ranges: dates, dateOrDay, weekDays } = this.state;
    let sentData;

    if (dateOrDay) {
      sentData = JSON.stringify({ name, weekDays });
    } else {
      sentData = JSON.stringify({ name, dates });
    }

    $.ajax({
        type: 'POST',
        url: '/api/meetings',
        data: sentData,
        contentType: 'application/json',
        dataType: 'json',
        success: data => console.log(data),
      });
  }

  @autobind
  handleMeetingNameChange(ev) {
    this.setState({ meetingName: ev.target.value });
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
  handleDateOrDay(ev) {
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
       <div id="new-meeting-modal" className="modal modal-fixed-footer">
        <div className="modal-content">
          <div className="row">
            <form className="col s12">
              <h5>New meeting</h5>
              <div className="row">
                <div className="input-field col s12">
                  <input
                    id="meeting_name"
                    type="text"
                    value={this.state.meetingName}
                    onChange={this.handleMeetingNameChange}
                    className="validate"
                  />
                  <label htmlFor="meeting_name">Meeting Name</label>
                </div>
              </div>
              <div className="switch center-align">
                <label>
                  Specific Dates
                  <input
                    type="checkbox"
                    onClick={this.handleDateOrDay}
                    checked={this.state.dateOrDay}
                  />
                  <span className="lever" />
                  Weekdays
                </label>
              </div>
              { !this.state.dateOrDay ?
                <div className="row">
                  <div className="input-field col s12">
                    { from && to &&
                      <a className='btn-flat center-align' href="#" onClick={ this.handleResetClick }>Reset</a>
                    }
                    <DayPicker
                      fromMonth={new Date()}
                      modifiers = { modifiers }
                      onDayClick={ this.handleDayClick }
                    />
                  </div>
                </div>
                : null
              }
              { this.state.dateOrDay ?
                <div className="row">
                  <br />
                  <div className="col s12">
                    {
                      weekDays.map((day, index) => (
                        <a
                          key={index}
                          className='btn-flat disabled'
                          onClick={this.handleWeekdaySelect}
                        >{day}</a>
                      ))
                    }
                  </div>
                </div>
                : null
              }
            </form>
          </div>
        </div>
        <div className="modal-footer">
          {this.state.meetingName &&
            <a
              href="/dashboard"
              className="modal-action modal-close waves-effect waves-green btn-flat"
              onClick={this.createMeeting}
            >Submit</a>
          }
        </div>
      </div>
    );
  }
}
