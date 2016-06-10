import React from 'react';
import DayPicker, { DateUtils } from 'react-day-picker';
import cssModules from 'react-css-modules';
import autobind from 'autobind-decorator';
import _ from 'lodash';
import { browserHistory } from 'react-router';
import { checkStatus } from '../util/fetch.util';

import styles from '../styles/event-card.css';
import 'react-day-picker/lib/style.css';

class EventCard extends React.Component {
  constructor(props) {
    super(props);

    const ranges = props.event.dates.map(({ fromDate, toDate }) => ({
      from: new Date(fromDate),
      to: new Date(toDate),
    }));

    const dates = props.event.dates.map(({ fromDate, toDate }) => ({
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
    }));

    if (props.event.dates.length === 0) delete props.event.dates;
    else if (props.event.weekDays === undefined) delete props.event.weekDays;

    this.state = {
      participants: props.event.participants,
      ranges,
      dates,
      event: props.event,
      user: {},
    };
  }

  componentDidMount() {
    $.get('/api/auth/current', user => {
      if (user !== '') this.setState({ user });
    });
  }

  @autobind
  async deleteEvent() {
    const response = await fetch(`/api/events/${this.state.event._id}`, {
      credentials: 'same-origin', method: 'DELETE',
    });

    try {
      checkStatus(response);
    } catch (err) {
      console.log(err); return;
    }

    browserHistory.push('/dashboard');
  }

  render() {
    const modifiers = {
      selected: day =>
        DateUtils.isDayInRange(day, this.state) ||
        this.state.ranges.some(v => DateUtils.isDayInRange(day, v)),
    };

    const { event, user } = this.state;

    let isOwner;

    if (user !== undefined) {
      if (user.github) isOwner = event.owner === user.github.username;
      else if (user.facebook) isOwner = event.owner === user.facebook.username;
      else if (user.local) isOwner = event.owner === user.local.username;
    }

    // Get maximum and minimum month from the selected dates to limit the daypicker to those months
    let maxDate;
    let minDate;

    if (this.state.ranges) {
      const dateInRanges = _.flatten(this.state.ranges.map(range => [range.from, range.to]));
      maxDate = new Date(Math.max.apply(null, dateInRanges));
      minDate = new Date(Math.min.apply(null, dateInRanges));
    }

    return (
      <div className="card" styleName="event">
        {
          isOwner ?
            <a
              className="btn-floating btn-large waves-effect waves-light red"
              styleName="delete-event"
              onClick={this.deleteEvent}
            ><i className="material-icons">delete</i></a>
            : null
        }
        <div className="card-content">
          <span className="card-title">{event.name}</span>
          <div className="row">
            <div className="col s12">
              {event.dates ?
                <DayPicker
                  className="alt"
                  styleName="day-picker"
                  initialMonth={minDate}
                  fromMonth={minDate}
                  toMonth={maxDate}
                  modifiers={modifiers}
                /> :
                Object.keys(event.weekDays).map((day, index) => {
                  let className = 'btn-flat alt';
                  if (!event.weekDays[day]) {
                    className += ' disabled';
                  }

                  return (
                    <a
                      id="alt"
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
          <div className="participant-list">
            <h6><strong>Participants</strong></h6>
            {event.participants.map((participant, index) => (
              <div className="participant" styleName="participant" key={index}>
                <img
                  alt="participant-avatar"
                  className="circle"
                  styleName="participant-img"
                  src={participant.avatar}
                />
                {participant.name}
              </div>
            ))}
          </div>
        </div>
        <div className="card-action">
          <a href={`/event/${event.uid}`}>View Details</a>
        </div>
      </div>
    );
  }
}

EventCard.propTypes = {
  event: React.PropTypes.object,
  removeEventFromDashboard: React.PropTypes.func,
};

export default cssModules(EventCard, styles);
