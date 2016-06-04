import React from 'react';
import update from 'react-addons-update';
import autobind from 'autobind-decorator';
import { browserHistory } from 'react-router';
import DayPicker, { DateUtils } from 'react-day-picker';
import cssModules from 'react-css-modules';
import fetch from 'isomorphic-fetch';
import _ from 'lodash';

import AvailabilityGrid from './AvailabilityGrid';

import { checkStatus } from '../util/fetch.util';

import styles from '../styles/event-card.css';
import 'react-day-picker/lib/style.css';

class EventDetailsComponent extends React.Component {
  constructor(props) {
    super(props);
    const eventParticipantsIds = props.event.participants.map(participant => participant._id);

    const ranges = props.event.dates.map(({ fromDate, toDate }) => ({
      from: new Date(fromDate),
      to: new Date(toDate),
    }));

    const dates = props.event.dates.map(({ fromDate, toDate }) => ({
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
    }));

    this.state = {
      event: props.event,
      ranges,
      dates,
      days: props.event.weekDays,
      user: {},
      eventParticipantsIds,
    };
  }

  componentDidMount() {
    $.get('/api/auth/current', user => {
      if (user !== '') {
        this.setState({ user });
      }
    });
  }

  @autobind
  async joinEvent() {
    let name;
    let avatar;

    if (this.state.user.local) {
      name = this.state.user.local.username;
      avatar = this.state.user.local.avatar;
    } else if (this.state.user.github) {
      name = this.state.user.github.username;
      avatar = this.state.user.github.avatar;
    } else if (this.state.user.facebook) {
      name = this.state.user.facebook.username;
      avatar = this.state.user.facebook.avatar;
    }

    const participant = {
      name,
      avatar,
      _id: this.state.user._id,
    };

    const event = update(this.state.event, {
      participants: { $push: [participant] },
    });

    const eventParticipantsIds = update(this.state.eventParticipantsIds, {
      $push: [this.state.user._id],
    });

    const sentData = JSON.stringify(event);

    const response = await fetch(`/api/events/${event._id}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      method: 'PUT',
      body: sentData,
    });

    try {
      checkStatus(response);
    } catch (err) {
      console.log(err); return;
    }

    this.setState({ event, eventParticipantsIds });
  }

  @autobind
  showAvailability(ev) {
    document.getElementById('availability-grid').className = '';
    ev.target.className += ' hide';
  }

  @autobind
  submitAvailability() {
    document.getElementById('availability-grid').className += ' hide';
    const enterAvailButton = document.getElementById('enterAvailButton');
    enterAvailButton.className = enterAvailButton.className.replace('hide', '');
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

    // Determine the months to show in the datepicker via the maximum and minimum date in the time
    // ranges

    let maxDate;
    let minDate;

    if (this.state.ranges) {
      const dateInRanges = _.flatten(this.state.ranges.map(range => [range.from, range.to]));
      maxDate = new Date(Math.max.apply(null, dateInRanges));
      minDate = new Date(Math.min.apply(null, dateInRanges));
    }

    return (
      <div className="card meeting" styleName="event-details">
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
                  initialMonth={minDate}
                  fromMonth={minDate}
                  toMonth={maxDate}
                  modifiers={modifiers}
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
                      style={{ cursor: 'default' }}
                    >{day}</a>
                  );
                })
              }
            </div>
          </div>
          <div id="grid" className="center">
            <div id="availability-grid" className="hide">
              <AvailabilityGrid
                dates={this.state.dates}
              />
              <br />
              <a
                className="waves-effect waves-light btn"
                onClick={this.submitAvailability}
              >Submit</a>
            </div>
            {Object.keys(this.state.user).length > 0 ?
              this.state.eventParticipantsIds.indexOf(this.state.user._id) > -1 ?
                <a
                  id="enterAvailButton"
                  className="waves-effect waves-light btn"
                  onClick={this.showAvailability}
                >Enter my availability</a> :
                <a
                  className="waves-effect waves-light btn"
                  onClick={this.joinEvent}
                >Join Event</a> :
              <p>Login/Sign Up to enter your availability!</p>
            }
          </div>
          <br />
          <div>
            <h6><strong>Participants</strong></h6>
            {event.participants.map((participant, index) => (
              <div className="participant" styleName="participant" key={index}>
                <img
                  className="circle"
                  styleName="participant-img"
                  src={participant.avatar}
                  alt="participant avatar"
                />
                {participant.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

EventDetailsComponent.propTypes = {
  event: React.PropTypes.object,
};

export default cssModules(EventDetailsComponent, styles);
