import React from 'react';
import update from 'react-addons-update';
import autobind from 'autobind-decorator';
import { browserHistory } from 'react-router';
import cssModules from 'react-css-modules';
import fetch from 'isomorphic-fetch';
import nprogress from 'nprogress';
import jsonpatch from 'fast-json-patch';
import DeleteModal from '../components/DeleteModal';
import Notification from '../components/vendor/react-notification';
import AvailabilityGrid from './AvailabilityGrid';
import { checkStatus, parseJSON } from '../util/fetch.util';
import { getCurrentUser } from '../util/auth';
import styles from '../styles/event-card.css';
import ParticipantsList from '../components/ParticipantsList';
import BestTimesDisplay from '../components/BestTimeDisplay';


class EventDetailsComponent extends React.Component {
  constructor(props) {
    super(props);
    const eventParticipantsIds = props.event.participants.map(participant => participant.userId);
    const { event } = props;

    const ranges = event.dates.map(({ fromDate, toDate }) => ({
      from: new Date(fromDate),
      to: new Date(toDate),
    }));

    const dates = event.dates.map(({ fromDate, toDate }) => ({
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
    }));

    this.state = {
      event,
      ranges,
      dates,
      user: {},
      eventParticipantsIds,
      participants: event.participants,
      showHeatmap: false,
      myAvailability: [],
      notificationIsActive: false,
      notificationMessage: '',
      notificationTitle: '',
      showEmail: false,
    };
  }

  async componentWillMount() {
    const { event } = this.state;
    const user = await getCurrentUser();
    if (user) {
      let showHeatmap = false;
      let myAvailability = [];

      const me = this.state.participants.find(participant =>
        participant.userId === user._id,
      );

      if (me && me.availability) {
        showHeatmap = true;
        myAvailability = me.availability;
      }

      this.setState({ user, showHeatmap, myAvailability });
    }
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

  selectElementContents(el) {
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

  @autobind
  async joinEvent() {
    const { name, avatar, _id: userId } = this.state.user;

    const participant = { name, avatar, userId };

    const event = update(this.state.event, { $set: this.state.event });
    const observerEvent = jsonpatch.observe(event);

    event.participants.push(participant);

    const eventParticipantsIds = update(this.state.eventParticipantsIds, {
      $push: [this.state.user._id],
    });

    nprogress.configure({ showSpinner: false });
    nprogress.start();

    const patches = jsonpatch.generate(observerEvent);
    const response = await fetch(`/api/events/${event._id}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      method: 'PATCH',
      body: JSON.stringify(patches),
    });

    try {
      checkStatus(response);
    } catch (err) {
      console.log(err);
      this.setState({
        notificationIsActive: true,
        notificationMessage: 'Failed to join event. Please try again later.',
        notificationTitle: 'Error!',
        showEmail: false,
      });
      return;
    } finally {
      nprogress.done();
      this.sendEmailOwner(event);
    }

    this.setState({ event, eventParticipantsIds });
  }

  async loadOwnerData(_id) {
    const response = await fetch(`/api/user/${_id}`, { credentials: 'same-origin' });
    try {
      checkStatus(response);
      return await parseJSON(response);
    } catch (err) {
      console.log('loadOwnerData', err);
      this.addNotification('Error!!', 'Failed to load owner Data. Please try again later.');
      return null;
    }
  }

  async sendEmailOwner(event) {
    const { name } = this.state.user;
    const fullUrl = `${location.protocol}//${location.hostname}${(location.port ? `:${location.port}` : '')}`;
    const ownerData = await this.loadOwnerData(event.owner);
    const msg = {
      guestName: name,
      eventName: event.name,
      eventId: event._id,
      eventOwner: event.owner,
      url: `${fullUrl}/event/${event._id}`,
      to: ownerData.emails[0],
      subject: 'Invite Accepted!!',
    };
    const response = await fetch('/api/email/ownerNotification', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      method: 'POST',
      body: JSON.stringify(msg),
    });

    try {
      checkStatus(response);
    } catch (err) {
      console.log('sendEmailOwner', err);
      this.setState({
        notificationIsActive: true,
        notificationMessage: 'Failed to send email for event Owner.',
        notificationTitle: 'Error!',
        showEmail: false,
      });
    }
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
    nprogress.configure({ showSpinner: false });
    nprogress.start();
    const response = await fetch(`/api/events/${this.state.event._id}`, {
      credentials: 'same-origin',
    });
    let event;

    try {
      checkStatus(response);
      event = await parseJSON(response);
    } catch (err) {
      console.log(err);
      this.setState({
        notificationIsActive: true,
        notificationMessage: 'Failed to update availability. Please try again later.',
        notificationTitle: 'Error!',
        showEmail: false,
      });
      return;
    } finally {
      nprogress.done();
    }

    this.setState({
      notificationIsActive: true,
      notificationMessage: 'Saved availability successfully.',
      notificationTitle: 'Success!',
      showEmail: false,
    });

    this.generateBestDatesAndTimes(event);
    this.setState({ showHeatmap: true, myAvailability, event, participants: event.participants });
  }

  @autobind
  handleDelete(result) {
    if (result === true) {
      this.setState({
        notificationIsActive: true,
        notificationMessage: 'Event successfully deleted!',
        notificationTitle: '',
        showEmail: false,
      });
      browserHistory.push('/dashboard');
    } else {
      console.log('error at handleDelete EventDetailsComponent', result);
      this.setState({
        notificationIsActive: true,
        notificationMessage: 'Failed to delete event. Please try again later.',
        notificationTitle: 'Error!',
        showEmail: false,
      });
    }
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
      this.selectElementContents(document.getElementsByClassName('notification-bar-message')[0]);
    }, 100);
  }

  render() {
    const { event, user, showHeatmap, participants, myAvailability, eventParticipantsIds, showEmail } = this.state;
    const availability = participants.map(participant => participant.availability);
    let isOwner;

    if (user !== undefined) {
      isOwner = event.owner === user._id;
    }

    const notifActions = [{
      text: 'Dismiss',
      handleClick: () => { this.setState({ notificationIsActive: false }); },
    }];

    if (showEmail) {
      notifActions.push({
        text: 'Email Event',
        handleClick: () => { window.location.href = `mailto:?subject=Schedule ${event.name}&body=Hey there,%0D%0A%0D%0AUsing the following tool, please block your availability for ${event.name}:%0D%0A%0D%0A${window.location.href} %0D%0A%0D%0A All times will automatically be converted to your local timezone.`; },
      });
    }

    return (
      <div className="card meeting" styleName="event-details">
         {
          isOwner ?
            <div>
              <DeleteModal event={event} cb={this.handleDelete} />
            </div> : null
        }
        <div className="card-content">
          <span styleName="card-title" className="card-title">{event.name}</span>
          <h6 id="best"><strong>All participants so far are available at:</strong></h6>
          <BestTimesDisplay event={event} curUser={user} disablePicker={true} />
          {showHeatmap ?
            <div id="heatmap">
              <AvailabilityGrid
                dates={this.state.dates}
                availability={availability}
                editAvail={this.editAvail}
                participants={participants}
                heatmap
              />
            </div> :
            <div id="grid" className="center">
              <div id="availability-grid" className="hide">
                <AvailabilityGrid
                  dates={this.state.dates}
                  user={this.state.user}
                  availability={availability}
                  myAvailability={myAvailability}
                  submitAvail={this.submitAvailability}
                  event={event}
                />
              </div>
              {Object.keys(user).length > 0 ?
                eventParticipantsIds.indexOf(user._id) > -1 ?
                  <a
                    id="enterAvailButton"
                    className="waves-effect waves-light btn"
                    onClick={this.showAvailability}
                  >Enter my availability</a> :
                  <a
                    className="waves-effect waves-light btn"
                    onClick={this.joinEvent}
                  >Join Event</a> :
                  <p>Login to enter your availability!</p>
              }
            </div>
          }
          <br />
          <ParticipantsList event={event} />
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
      </div>
    );
  }
}

EventDetailsComponent.propTypes = {
  event: React.PropTypes.object,
};

export default cssModules(EventDetailsComponent, styles);
