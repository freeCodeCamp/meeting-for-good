import React from 'react';
import update from 'react-addons-update';
import autobind from 'autobind-decorator';
import cssModules from 'react-css-modules';
import fetch from 'isomorphic-fetch';
import nprogress from 'nprogress';
import jsonpatch from 'fast-json-patch';
import { Card, CardTitle, CardText } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';

import DeleteModal from '../../components/DeleteModal/DeleteModal';
import Notification from '../../components/vendor/react-notification';
import AvailabilityGrid from '../AvailabilityGrid/AvailabilityGrid';
import { checkStatus, parseJSON } from '../../util/fetch.util';
import { getCurrentUser } from '../../util/auth';
import styles from './event-details-component.css';
import ParticipantsList from '../../components/ParticipantsList/ParticipantsList';
import BestTimesDisplay from '../../components/BestTimeDisplay/BestTimeDisplay';

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
      showButtonAviability: 'none',
      showAvailabilityGrid: 'none',
    };
  }

  async componentWillMount() {
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
    $('.notification-bar-action').on('click', () => {
      this.setState({ notificationIsActive: false });
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
      });
      return;
    } finally {
      nprogress.done();
      this.sendEmailOwner(event);
    }

    this.setState({ event, eventParticipantsIds, showAvailabilityGrid: 'block' });
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
      });
    }
  }

  @autobind
  showAvailability(ev) {
    this.setState({ showButtonAviability: 'hidden', showAvailabilityGrid: 'block' });
  }

  @autobind
  editAvail() {
    this.setState({ showHeatmap: false, showButtonAviability: 'none', showAvailabilityGrid: 'block' });
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
      this.setState({ showHeatmap: true, myAvailability, event, participants: event.participants });
    } catch (err) {
      console.log(err);
      this.setState({
        notificationIsActive: true,
        notificationMessage: 'Failed to update availability. Please try again later.',
        notificationTitle: 'Error!',
      });
      return;
    } finally {
      nprogress.done();
    }

    this.setState({
      notificationIsActive: true,
      notificationMessage: 'Saved availability successfully.',
      notificationTitle: 'Success!',
    });
  }

  @autobind
  handleShowInviteGuestsDrawer() {
    const { event } = this.state;
    this.props.showInviteGuests(event);
  }

  @autobind
  handleDelete() {
    const { event } = this.state;
    this.props.cbDeleteEvent(event._id);
  }

  render() {
    const {
      event,
      user, showHeatmap, participants,
      myAvailability, eventParticipantsIds,
      dates, showAvailabilityGrid } = this.state;
    const availability = participants.map(participant => participant.availability);
    let isOwner;
    const inlineStyles = {
      card: {
        availabilityGrid: {
          display: showAvailabilityGrid,
        },
      },
    };

    if (user !== undefined) {
      isOwner = event.owner === user._id;
    }

    const notifActions = [{
      text: 'Dismiss',
      handleClick: () => { this.setState({ notificationIsActive: false }); },
    }];

    return (
      <Card styleName="card">
        {isOwner ? <DeleteModal event={event} cbEventDelete={this.handleDelete} /> : null}
        <CardTitle styleName="cardTitle">{event.name}</CardTitle>
        <CardText>
          <BestTimesDisplay event={event} disablePicker />
          {(showHeatmap) ?
            <div id="heatmap">
              <AvailabilityGrid
                dates={dates}
                availability={availability}
                editAvail={this.editAvail}
                participants={participants}
                heatmap
              />
            </div> :
            <div id="grid" styleName="aviabilityContainer" >
              <div style={inlineStyles.card.availabilityGrid}>
                <AvailabilityGrid
                  dates={dates}
                  user={user}
                  availability={availability}
                  myAvailability={myAvailability}
                  submitAvail={this.submitAvailability}
                  event={event}
                />
              </div>
              {(Object.keys(user).length > 0) ?
                (eventParticipantsIds.indexOf(user._id) > -1) ?
                  null
                  :
                  <RaisedButton
                    onClick={this.joinEvent}
                    label={'Join Event'}
                    backgroundColor="#000000"
                    labelColor="#ffffff"
                  />
                : null
            }
            </div>
          }
          <br />
          <ParticipantsList event={event} curUser={user} showInviteGuests={this.handleShowInviteGuestsDrawer} />
        </CardText>
        <Notification
          isActive={this.state.notificationIsActive}
          message={this.state.notificationMessage}
          actions={notifActions}
          title={this.state.notificationTitle}
          onDismiss={() => this.setState({ notificationIsActive: false })}
          dismissAfter={3000}
          activeClassName="notification-bar-is-active"
        />
      </Card>
    );
  }
}

EventDetailsComponent.propTypes = {
  event: React.PropTypes.object,
  showInviteGuests: React.PropTypes.func,
  cbDeleteEvent: React.PropTypes.func,
};

export default cssModules(EventDetailsComponent, styles);
