import React from 'react';
import DayPicker, { DateUtils } from 'react-day-picker';
import cssModules from 'react-css-modules';
import moment from 'moment';

import styles from '../styles/event-card.css';
import 'react-day-picker/lib/style.css';

class MeetingEvent extends React.Component {
  constructor(props) {
    super(props);
    props.meeting.dates = props.meeting.dates.map(date => {
      if (date.from !== null && date.to !== null) {
        date.from = moment(date.from).toDate();
        date.to = moment(date.to).toDate();
      }
      return date;
    });

    if (props.meeting.dates.length === 0) {
      delete props.meeting.dates;
    } else if (props.meeting.weekDays === undefined) {
      delete props.meeting.weekDays;
    }

    this.state = {
      ranges: props.meeting.dates,
    };
  }

  render() {
    const modifiers = {
      selected: day =>
        DateUtils.isDayInRange(day, this.state) ||
        this.state.ranges.some(v => DateUtils.isDayInRange(day, v)),
    };

    const { meeting } = this.props;

    return (
      <div className="card meeting" styleName="meeting-event">
        <div className="card-content">
          <span className="card-title">{meeting.name}</span>
          <div className="row">
            <div className="col s12">
              {meeting.dates ?
                <DayPicker
                  fromMonth={new Date()}
                  modifiers = { modifiers }
                /> :
                Object.keys(meeting.weekDays).map((day, index) => {
                  let className = 'btn-flat';
                  if (!meeting.weekDays[day]) {
                    className += ' disabled';
                  }

                  return (
                    <a
                      key={index}
                      className={className}
                      onClick={this.handleWeekdaySelect}
                    >{day}</a>
                  );
                })
              }
            </div>
          </div>
          <br />
          <div>
            <h6><strong>Participants</strong></h6>
            {meeting.participants.map((participant, index) => (
              <div className="participant" styleName="participant" key={index}>
                <img className="circle" styleName="participant-img" src={participant.avatar} />
                {participant.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

MeetingEvent.propTypes = {
  meeting: React.PropTypes.object,
};

export default cssModules(MeetingEvent, styles);
