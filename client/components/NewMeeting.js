import React from 'react';
import DayPicker, { DateUtils } from 'react-day-picker';
import 'react-day-picker/lib/style.css';

export default class NewMeeting extends React.Component {
  constructor() {
    super();
    this.state = {
      ranges: [{
        from: null,
        to: null,
      }],
      meetingName: null,
    };
    this.handleDayClick = this.handleDayClick.bind(this);
    this.handleResetClick = this.handleResetClick.bind(this);
    this.createMeeting = this.createMeeting.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

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

  handleResetClick(e) {
    e.preventDefault();
    this.setState({ ranges: [{
      from: null,
      to: null,
    }] });
  }

  createMeeting() {
    const { meetingName, ranges } = this.state;
    const sentData = JSON.stringify({ name: meetingName, dates: ranges });
    $.ajax({
      type: 'POST',
      url: '/api/meetings',
      data: sentData,
      contentType: 'application/json',
      dataType: 'json',
      success: data => console.log(data),
    });
  }

  handleChange(ev) {
    this.setState({ meetingName: ev.target.value });
  }

  render() {
    const modifiers = {
      selected: day =>
        DateUtils.isDayInRange(day, this.state) ||
        this.state.ranges.some(v => DateUtils.isDayInRange(day, v)),
    };

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
                    onChange={this.handleChange}
                    className="validate"
                  />
                  <label htmlFor="meeting_name">Meeting Name</label>
                </div>
              </div>
              <div className="row">
                <div className="input-field col s12">
                  Select dates that may work:
                  { from && to &&
                    <p>
                      <a href="#" onClick={ this.handleResetClick }>Reset</a>
                    </p>
                  }
                  <DayPicker
                    fromMonth={new Date()}
                    modifiers = { modifiers }
                    onDayClick={ this.handleDayClick }
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
        <div className="modal-footer">
          {this.state.meetingName &&
            <a href="/dashboard"
              className="modal-action modal-close waves-effect waves-green btn-flat"
              onClick={this.createMeeting}
            >Submit</a>
          }
        </div>
      </div>
    );
  }
}
