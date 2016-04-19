import React from 'react';
import DayPicker, { DateUtils } from 'react-day-picker';
import cssModules from 'react-css-modules';
import moment from 'moment';

import styles from '../styles/event-card.css';
import 'react-day-picker/lib/style.css';

class EventCard extends React.Component {
  constructor(props) {
    super(props);
    props.event.dates = props.event.dates.map(date => {
      if (date.from !== null && date.to !== null) {
        date.from = moment(date.from).toDate();
        date.to = moment(date.to).toDate();
      }
      return date;
    });

    if (props.event.dates.length === 0) {
      delete props.event.dates;
    } else if (props.event.weekDays === undefined) {
      delete props.event.weekDays;
    }

    this.state = {
      ranges: props.event.dates,
    };
  }

  render() {
    const modifiers = {
      selected: day =>
        DateUtils.isDayInRange(day, this.state) ||
        this.state.ranges.some(v => DateUtils.isDayInRange(day, v)),
    };

    const { event } = this.props;

    return (
      <div className="card" styleName="event">
        <div className="card-content">
          <span className="card-title">{event.name}</span>
          <div className="row">
            <div className="col s12">
              {event.dates ?
                <DayPicker
                  fromMonth={new Date()}
                  modifiers = { modifiers }
                /> :
                Object.keys(event.weekDays).map((day, index) => {
                  let className = 'btn-flat';
                  if (!event.weekDays[day]) {
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
            {event.participants.map((participant, index) => (
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

EventCard.propTypes = {
  event: React.PropTypes.object,
};

export default cssModules(EventCard, styles);
