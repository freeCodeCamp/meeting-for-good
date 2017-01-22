import React from 'react';
import autobind from 'autobind-decorator';
import cssModules from 'react-css-modules';
import 'react-day-picker/lib/style.css';
import Notification from '../vendor/react-notification';
import AvailabilityGridContainer from '../AvailbilityGrid/AvailabilityGridContainer';
import styles from '../../styles/event-card.css';

class EventDetails extends React.Component {
  @autobind
  static showAvailability(ev) {
    document.getElementById('availability-grid').className = '';
    ev.target.className += ' hide';
  }

  @autobind
  static selectElementContents(el) {
    let range;
    if (window.getSelection && document.createRange) {
      range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(el);
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (document.body && document.body.createTextRange) {
      range = document.body.createTextRange();
      range.moveToElementText(el);
      range.select();
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      notificationIsActive: false,
      notificationMessage: '',
      notificationTitle: '',
      showEmail: false,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      $('.alt').each((i, el) => {
        $(el).parents('.card').find('#best')
          .remove();
      });
    }, 100);

    $('.notification-bar-action').on('click', () => {
      this.setState({ notificationIsActive: false, showEmail: false });
    });
  }

  @autobind
  shareEvent() {
    this.setState({
      notificationIsActive: true,
      notificationMessage: window.location.href,
      notificationTitle: 'Event URL:',
      showEmail: true,
    });
    setTimeout(() => {
      this.constructor.selectElementContents(
        document.getElementsByClassName('notification-bar-message')[0],
      );
    }, 100);
  }

  render() {
    let isOwner;

    const {
      bestTimes,
      isBestTime,
      event,
      user,
      participants,
      myAvailability,
      eventParticipantsIds,
      showHeatmap,
      dates,
    } = this.props;

    const availability = participants.map(participant => participant.availability);

    if (user !== undefined) {
      isOwner = event.owner === user._id;
    }

    const notifActions = [{
      text: 'Dismiss',
      handleClick: () => { this.setState({ notificationIsActive: false }); },
    }];

    if (this.state.showEmail) {
      notifActions.push({
        text: 'Email Event',
        handleClick: () => { window.location.href = `mailto:?subject=Schedule ${event.name}&body=Hey there,%0D%0A%0D%0AUsing the following tool, please block your availability for ${event.name}:%0D%0A%0D%0A${window.location.href} %0D%0A%0D%0A All times will automatically be converted to your local timezone.`; },
      });
    }

    return (
      <div className="card meeting" styleName="event-details">
        {
          isOwner ?
            <button
              className="mdl-button mdl-js-button mdl-button--fab mdl-button--colored"
              styleName="delete-event"
              onClick={() => document.querySelector('#deleteEventModal').showModal()}
            ><i className="material-icons">delete</i></button> : null
        }
        <div className="card-content">
          <span styleName="card-title" className="card-title">{event.name}</span>
          <h6 id="best"><strong>All participants so far are available at:</strong></h6>
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
                )) : null
              }
            </div>
          </div>
          {showHeatmap ?
            <div id="heatmap">
              <AvailabilityGridContainer
                dates={dates}
                availability={availability}
                editAvail={this.props.editAvail}
                participants={participants}
                heatmap
              />
            </div> :
            <div id="grid" className="center">
              <div id="availability-grid" className="hide">
                <AvailabilityGridContainer
                  dates={dates}
                  user={user}
                  availability={availability}
                  myAvailability={myAvailability}
                  submitAvail={this.props.submitAvailability}
                  event={event}
                />
              </div>
              {Object.keys(user).length > 0 ?
                eventParticipantsIds.indexOf(user._id) > -1 ?
                  <a
                    id="enterAvailButton"
                    className="waves-effect waves-light btn"
                    onClick={this.constructor.showAvailability}
                  >Enter my availability</a> :
                  <a
                    className="waves-effect waves-light btn"
                    onClick={this.props.joinEvent}
                  >Join Event</a> :
                  <p>Login to enter your availability!</p>
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
        <div styleName="action" className="card-action">
          <a onClick={this.shareEvent}>Share Event</a>
        </div>
        <Notification
          isActive={this.state.notificationIsActive}
          message={this.state.notificationMessage}
          actions={notifActions}
          title={this.state.notificationTitle}
          onDismiss={() => this.setState({ notificationIsActive: false })}
          dismissAfter={10000}
          activeClassName="notification-bar-is-active"
        />
        <dialog
          onClick={ev => ev.stopPropagation()}
          className="mdl-dialog"
          styleName="mdl-dialog"
          id="deleteEventModal"
        >
          <h6 styleName="modal-title" className="mdl-dialog__title">Are you sure you want to delete the event?</h6>
          <div className="mdl-dialog__actions">
            <button
              type="button"
              className="mdl-button close"
              onClick={() => document.querySelector('#deleteEventModal').close()}
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

EventDetails.propTypes = {
  event: React.PropTypes.object,
  bestTimes: React.PropTypes.object,
  user: React.PropTypes.object,
  participants: React.PropTypes.arrayOf(React.PropTypes.object),
  eventParticipantsIds: React.PropTypes.array,
  deleteEvent: React.PropTypes.func,
  joinEvent: React.PropTypes.func,
  submitAvailability: React.PropTypes.func,
  editAvail: React.PropTypes.func,
  isBestTime: React.PropTypes.bool,
  showHeatmap: React.PropTypes.bool,
  dates: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  myAvailability: React.PropTypes.array,
};

export default cssModules(EventDetails, styles);
