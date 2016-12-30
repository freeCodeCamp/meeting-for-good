import React from 'react';
import DayPicker, { DateUtils } from 'react-day-picker';
import cssModules from 'react-css-modules';
import autobind from 'autobind-decorator';
import _ from 'lodash';
import { Link, browserHistory } from 'react-router';
import { Notification } from 'react-notification';
import 'react-day-picker/lib/style.css';
import styles from '../styles/event-card.css';

class EventCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      notificationMessage: '',
      notificationIsActive: false,
    };
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
  redirectToEvent() {
    browserHistory.push(`/event/${event._id}`);
  }

  render() {
    const { event, user, ranges, isBestTime, bestTimes } = this.props;
    let isOwner;
    let modifiers;

    if (user !== undefined) {
      isOwner = event.owner === user._id;
    }

    // Get maximum and minimum month from the selected dates to limit the
    // daypicker to those months
    let maxDate;
    let minDate;

    if (ranges) {
      modifiers = {
        selected: day =>
          DateUtils.isDayInRange(day, this.state) ||
          ranges.some(v => DateUtils.isDayInRange(day, v)),
      };
      const dateInRanges = _.flatten(ranges.map(range =>
        [range.from, range.to]
      ));
      maxDate = new Date(Math.max.apply(null, dateInRanges));
      minDate = new Date(Math.min.apply(null, dateInRanges));
    }

    return (
      <div onClick={this.redirectToEvent} className="card" styleName="event">
        {
          isOwner ?
            <button
              className="mdl-button mdl-js-button mdl-button--fab\
                         mdl-button--colored"
              styleName="delete-event"
              onClick={(ev) => {
                ev.stopPropagation();
                document.querySelector(
                  `#deleteEventModal${this.props.event._id}`
                ).showModal();
              }}
            ><i className="material-icons">delete</i></button> : null
        }
        <div className="card-content">
          <span styleName="card-title" className="card-title">{event.name}</span>
          <h6 id="best">
            <strong>All participants so far are available at:</strong>
        </h6>
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
          <Link styleName="details-link" to={`/event/${event.uid}`}>
            View Details
        </Link>
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
          onClick={ev => ev.stopPropagation()}
          className="mdl-dialog"
          styleName="mdl-dialog"
          id={`deleteEventModal${event._id}`}
        >
          <h6 styleName="modal-title" className="mdl-dialog__title">
            Are you sure you want to delete the event?
          </h6>
          <div className="mdl-dialog__actions">
            <button
              type="button"
              className="mdl-button close"
              onClick={() =>
                document.querySelector(`#deleteEventModal${event._id}`).close(),
              }
            >Cancel</button>
            <button
              type="button"
              className="mdl-button"
              style={{ color: '#f44336' }}
              onClick={this.props.deleteEvent}
            >Yes</button>
          </div>
        </dialog>
      </div>
    );
  }
}

EventCard.propTypes = {
  event: React.PropTypes.object,
  isBestTime: React.PropTypes.bool,
  deleteEvent: React.PropTypes.func,
  user: React.PropTypes.object,
  ranges: React.PropTypes.array,
};

export default cssModules(EventCard, styles);
