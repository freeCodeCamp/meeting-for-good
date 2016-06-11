import React from 'react';
import update from 'react-addons-update';
import autobind from 'autobind-decorator';
import { browserHistory } from 'react-router';
import DayPicker, { DateUtils } from 'react-day-picker';
import cssModules from 'react-css-modules';
import fetch from 'isomorphic-fetch';
import _ from 'lodash';
import moment from 'moment';

import AvailabilityGrid from './AvailabilityGrid';

import { checkStatus, parseJSON } from '../util/fetch.util';

import styles from '../styles/event-card.css';
import 'react-day-picker/lib/style.css';

class EventDetailsComponent extends React.Component {
  constructor(props) {
    super(props);
    const eventParticipantsIds = props.event.participants.map(participant => participant._id);
    const { event } = props;

    let ranges;
    let dates;

    if (event.weekDays) {
      dates = event.dates;
    } else {
      delete event.weekDays;

      ranges = event.dates.map(({ fromDate, toDate }) => ({
        from: new Date(fromDate),
        to: new Date(toDate),
      }));

      dates = event.dates.map(({ fromDate, toDate }) => ({
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
      }));
    }

    this.state = {
      event,
      ranges,
      dates,
      days: event.weekDays,
      user: {},
      eventParticipantsIds,
      participants: event.participants,
      showHeatmap: false,
      myAvailability: [],
    };
  }

  componentWillMount() {
    $.get('/api/auth/current', user => {
      if (user !== '') {
        let showHeatmap = false;
        let myAvailability = [];

        const me = this.state.participants.find(participant =>
          participant._id === user._id
        );

        if (me && me.availability) {
          showHeatmap = true;
          myAvailability = me.availability;
        }

        this.setState({ user, showHeatmap, myAvailability });
      }
    });
  }

  componentDidMount() {
    const availability = [];
    const overlaps = [];
    const displayTimes = {};

    this.state.participants.forEach(user => {
      if (user.availability !== undefined) availability.push(user.availability);
    });

    if(availability.length > 1){
      console.log(availability)
      for(let i = 0; i < availability[0].length; i++){
        let current = availability[0][i]
        let count = 0;
        for(let j = 0; j < availability.length; j++){
          for(let k = 0; k < availability[j].length; k++){
            if(availability[j][k][0] === current[0]) {
              count++;
            }
          }
        }
        if(count === availability.length) overlaps.push(current);
      }

      // console.log(overlaps)

      if(overlaps.length !== 0){
        let index = 0;
        for(let i = 0; i < overlaps.length; i++){
          if(overlaps[i+1] !== undefined && overlaps[i][1] !== overlaps[i+1][0]){
            if(displayTimes[moment(overlaps[index][0]).format("DD MMM")] !== undefined) {
              displayTimes[moment(overlaps[index][0]).format("DD MMM")].hours.push(moment(overlaps[index][0]).format("HH:mm") + " to " + moment(overlaps[i][1]).format("HH:mm"))
              console.log(moment(overlaps[index][0]).format("HH:mm") + " to " + moment(overlaps[i][1]).format("HH:mm"))
            } else {
              displayTimes[moment(overlaps[index][0]).format("DD MMM")] = {}
              displayTimes[moment(overlaps[index][0]).format("DD MMM")].hours = [];
              displayTimes[moment(overlaps[index][0]).format("DD MMM")].hours.push(moment(overlaps[index][0]).format("HH:mm") + " to " + moment(overlaps[i][1]).format("HH:mm"))
              console.log(moment(overlaps[index][0]).format("HH:mm") + " to " + moment(overlaps[i][1]).format("HH:mm"))
            }
            index = i+1;
          } else if(overlaps[i+1] === undefined){
            if(displayTimes[moment(overlaps[index][0]).format("DD MMM")] !== undefined) {
              displayTimes[moment(overlaps[index][0]).format("DD MMM")].hours.push(moment(overlaps[index][0]).format("HH:mm") + " to " + moment(overlaps[i][1]).format("HH:mm"))
              console.log(moment(overlaps[index][0]).format("HH:mm") + " to " + moment(overlaps[i][1]).format("HH:mm"))
            } else {
              displayTimes[moment(overlaps[index][0]).format("DD MMM")] = {}
              displayTimes[moment(overlaps[index][0]).format("DD MMM")].hours = [];
              displayTimes[moment(overlaps[index][0]).format("DD MMM")].hours.push(moment(overlaps[index][0]).format("HH:mm") + " to " + moment(overlaps[i][1]).format("HH:mm"))
              console.log(moment(overlaps[index][0]).format("HH:mm") + " to " + moment(overlaps[i][1]).format("HH:mm"))
            }
          }
        }
      }

      this.setState({displayTimes})
    }
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
  editAvail() {
    this.setState({ showHeatmap: false }, () => {
      document.getElementById('enterAvailButton').click();
    });
  }

  @autobind
  async submitAvailability(myAvailability) {
    const response = await fetch(`/api/events/${this.state.event._id}`, {
      credentials: 'same-origin',
    });
    let event;

    try {
      checkStatus(response);
      event = await parseJSON(response);
    } catch (err) {
      console.log(err); return;
    }

    this.setState({ showHeatmap: true, myAvailability, event, participants: event.participants });
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
    let modifiers;

    const { event, user, showHeatmap, participants, myAvailability } = this.state;
    const availability = participants.map(participant => participant.availability);
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

      modifiers = {
        selected: day =>
          DateUtils.isDayInRange(day, this.state) ||
          this.state.ranges.some(v => DateUtils.isDayInRange(day, v)),
      };
    }

    const bestTimes = this.state.displayTimes;
    let isBestTime;

    if (bestTimes !== undefined) {
      if (Object.keys(bestTimes).length > 0) isBestTime = true;
      else isBestTime = false;
    } else isBestTime = false;

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
              {isBestTime ?
                Object.keys(bestTimes).map(date => (
                  <div>
                    <div styleName="bestTimeDate">
                      <i
                        className="material-icons"
                        styleName="material-icons"
                      >date_range</i>
                      {date}
                    </div>
                    <div styleName="bestTime">
                      <i
                        className="material-icons"
                        styleName="material-icons"
                      >alarm</i>
                      {bestTimes[date].hours.join(', ')}
                    </div>
                    <hr />
                  </div>
                )) :
                event.dates ?
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
          {showHeatmap ?
            <div id="heatmap">
              <AvailabilityGrid
                dates={this.state.dates}
                availability={availability}
                editAvail={this.editAvail}
                heatmap
              />
            </div> :
            <div id="grid" className="center">
              <div id="availability-grid" className="hide">
                {event.weekDays ?
                  <AvailabilityGrid
                    dates={this.state.dates}
                    user={this.state.user}
                    submitAvail={this.submitAvailability}
                    availability={availability}
                    myAvailability={myAvailability}
                    weekDays
                  /> :
                  <AvailabilityGrid
                    dates={this.state.dates}
                    user={this.state.user}
                    availability={availability}
                    myAvailability={myAvailability}
                    submitAvail={this.submitAvailability}
                  />
                }
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
          }
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
