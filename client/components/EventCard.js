import React from 'react';
import DayPicker, { DateUtils } from 'react-day-picker';
import cssModules from 'react-css-modules';
import autobind from 'autobind-decorator';
import _ from 'lodash';
import moment from 'moment';
import { Link, browserHistory } from 'react-router';
import nprogress from 'nprogress';
import { Notification } from 'react-notification';
import jsonpatch from 'fast-json-patch';
import 'react-day-picker/lib/style.css';

import { checkStatus } from '../util/fetch.util';
import { getCurrentUser } from '../util/auth';

import styles from '../styles/event-card.css';

class EventCard extends React.Component {
  constructor(props) {
    super(props);

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
      participants: props.event.participants,
      ranges,
      dates,
      event,
      user: {},
      notificationMessage: '',
      notificationIsActive: false,
    };
  }

  async componentWillMount() {
    const availability = [];
    const overlaps = [];
    const displayTimes = {};
    const user = await getCurrentUser();

    this.state.participants.forEach((user) => {
      if (user.availability !== undefined) availability.push(user.availability);
    });

    if (availability.length > 1) {
      for (let i = 0; i < availability[0].length; i += 1) {
        const current = availability[0][i];
        let count = 0;
        for (let j = 0; j < availability.length; j++) {
          for (let k = 0; k < availability[j].length; k += 1) {
            if (availability[j][k][0] === current[0]) {
              count += 1;
            }
          }
        }
        if (count === availability.length) overlaps.push(current);
      }

      if (overlaps.length !== 0) {
        let index = 0;
        for (let i = 0; i < overlaps.length; i++) {
          if (overlaps[i + 1] !== undefined && overlaps[i][1] !== overlaps[i + 1][0]) {
            if (displayTimes[moment(overlaps[index][0]).format('DD MMM')] !== undefined) {
              displayTimes[moment(overlaps[index][0]).format('DD MMM')].hours.push(`${moment(overlaps[index][0]).format('h:mm a')} to ${moment(overlaps[i][1]).format('h:mm a')}`);
            } else {
              displayTimes[moment(overlaps[index][0]).format('DD MMM')] = {};
              displayTimes[moment(overlaps[index][0]).format('DD MMM')].hours = [];
              displayTimes[moment(overlaps[index][0]).format('DD MMM')].hours.push(`${moment(overlaps[index][0]).format('h:mm a')} to ${moment(overlaps[i][1]).format('h:mm a')}`);
            }
            index = i + 1;
          } else if (overlaps[i + 1] === undefined) {
            if (displayTimes[moment(overlaps[index][0]).format('DD MMM')] !== undefined) {
              displayTimes[moment(overlaps[index][0]).format('DD MMM')].hours.push(`${moment(overlaps[index][0]).format('h:mm a')} to ${moment(overlaps[i][1]).format('h:mm a')}`);
            } else {
              displayTimes[moment(overlaps[index][0]).format('DD MMM')] = {};
              displayTimes[moment(overlaps[index][0]).format('DD MMM')].hours = [];
              displayTimes[moment(overlaps[index][0]).format('DD MMM')].hours.push(`${moment(overlaps[index][0]).format('h:mm a')} to ${moment(overlaps[i][1]).format('h:mm a')}`);
            }
          }
        }
      }
    }

    this.setState({ displayTimes, user });
  }

  componentDidMount() {
    setTimeout(() => {
      $('.alt').each((i, el) => {
        $(el).parents('.card').find('#best')
          .remove();
      });
    }, 100);
  }

  @autobind
  async deleteEvent() {
    const response =  await fetch(
      `/api/events/${this.props.event._id}`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'DELETE',
        credentials: 'same-origin',
      },
    );

    nprogress.configure({ showSpinner: false });
    nprogress.start();
    try {
      checkStatus(response);
    } catch (err) {
      console.log(err);
      this.setState({
        notificationIsActive: true,
        notificationMessage: 'Failed to delete event. Please try again later.',
      });
      return;
    } finally {
      nprogress.done();
    }

    this.props.removeEventFromDashboard(this.state.event._id);
  }

  @autobind
  redirectToEvent() {
    browserHistory.push(`/event/${this.state.event._id}`);
  }

  render() {
    const { event, user } = this.state;
    let isOwner;
    let modifiers;

    if (user !== undefined) {
      isOwner = event.owner === user._id;
    }

    // Get maximum and minimum month from the selected dates to limit the daypicker to those months
    let maxDate;
    let minDate;

    if (this.state.ranges) {
      modifiers = {
        selected: day =>
          DateUtils.isDayInRange(day, this.state) ||
          this.state.ranges.some(v => DateUtils.isDayInRange(day, v)),
      };
      const dateInRanges = _.flatten(this.state.ranges.map(range => [range.from, range.to]));
      maxDate = new Date(Math.max.apply(null, dateInRanges));
      minDate = new Date(Math.min.apply(null, dateInRanges));
    }

    const bestTimes = this.state.displayTimes;
    let isBestTime;

    if (bestTimes !== undefined) {
      if (Object.keys(bestTimes).length > 0) isBestTime = true;
      else isBestTime = false;
    } else isBestTime = false;

    return (
      <div onClick={this.redirectToEvent} className="card" styleName="event">
        {
          isOwner ?
            <button
              className="mdl-button mdl-js-button mdl-button--fab mdl-button--colored"
              styleName="delete-event"
              onClick={(ev) => {
                ev.stopPropagation();
                document.querySelector(`#deleteEventModal${this.state.event._id}`).showModal();
              }}
            ><i className="material-icons">delete</i></button> : null
        }
        <div className="card-content">
          <span styleName="card-title" className="card-title">{event.name}</span>
          <h6 id="best"><strong>All participants so far are available at:</strong></h6>
          <div className="row">
            <div className="col s12">
              {isBestTime ?
                Object.keys(bestTimes).map(date => (
                  <div key={date}>
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
                <DayPicker
                  className="alt"
                  styleName="day-picker"
                  initialMonth={minDate}
                  fromMonth={minDate}
                  toMonth={maxDate}
                  modifiers={modifiers}
                />
              }
            </div>
          </div>
          <br />
          <div className="participant-list">
            <h6><strong>Participants</strong></h6>
            {event.participants.map( participant => (
              <div className="participant" styleName="participant" key={participant._id}>
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
          <Link styleName="details-link" to={`/event/${event._id}`}>View Details</Link>
        </div>
        <Notification
          isActive={this.state.notificationIsActive}
          message={this.state.notificationMessage}
          action="Dismiss"
          title="Error!"
          onDismiss={() => this.setState({ notificationIsActive: false })}
          onClick={() => this.setState({ notificationIsActive: false })}
          activeClassName="notification-bar-is-active"
        />
        <dialog
          onClick={(ev) => ev.stopPropagation()}
          className="mdl-dialog"
          styleName="mdl-dialog"
          id={`deleteEventModal${this.state.event._id}`}
        >
          <h6 styleName="modal-title" className="mdl-dialog__title">Are you sure you want to delete the event?</h6>
          <div className="mdl-dialog__actions">
            <button
              type="button"
              className="mdl-button close"
              onClick={() => document.querySelector(`#deleteEventModal${this.state.event._id}`).close()}
            >Cancel</button>
            <button
              type="button"
              className="mdl-button"
              style={{ color: '#f44336' }}
              onClick={this.deleteEvent}
            >Yes</button>
          </div>
        </dialog>
      </div>
    );
  }
}

EventCard.propTypes = {
  event: React.PropTypes.object,
  removeEventFromDashboard: React.PropTypes.func,
};

export default cssModules(EventCard, styles);
