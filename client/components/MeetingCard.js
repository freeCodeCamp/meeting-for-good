import React from 'react';
import DayPicker, { DateUtils } from 'react-day-picker';
import cssModules from 'react-css-modules';
import moment from 'moment';

import styles from '../styles/meetingcard.css';
import 'react-day-picker/lib/style.css';

class MeetingCard extends React.Component {
  constructor(props) {
    super(props);
    props.meeting.dates = props.meeting.dates.map(date => {
      if (date.from !== null && date.to !== null) {
        date.from = moment(date.from).toDate();
        date.to = moment(date.to).toDate();
      }
      return date;
    });

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

    return (
      <div className="card meeting" styleName="meeting">
        <div className="card-content">
          <span className="card-title">{this.props.meeting.name}</span>
          <DayPicker
            fromMonth={new Date()}
            modifiers = { modifiers }
          />
          <br />
          <div>
            <h6><strong>Participants</strong></h6>
            {this.props.meeting.participants.map((participant, index) => (
              <div className="participant" styleName="participant" key={index}>
                <img className="circle" styleName="participant-img" src={participant.avatar} />
                {participant.name}
              </div>
            ))}
          </div>
        </div>
        <div className="card-action">
          <a href="#">View Details</a>
        </div>
      </div>
    );
  }
}

MeetingCard.propTypes = {
  meeting: React.PropTypes.object,
};

export default cssModules(MeetingCard, styles);
