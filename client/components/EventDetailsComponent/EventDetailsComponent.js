import React from 'react';
import update from 'react-addons-update';
import autobind from 'autobind-decorator';
import cssModules from 'react-css-modules';
import fetch from 'isomorphic-fetch';
import jsonpatch from 'fast-json-patch';
import { Card, CardTitle, CardText } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';

import DeleteModal from '../../components/DeleteModal/DeleteModal';
import Notification from '../../components/vendor/react-notification';
import AvailabilityGrid from '../AvailabilityGrid/AvailabilityGrid';
import { checkStatus, parseJSON } from '../../util/fetch.util';
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
      eventParticipantsIds,
      participants: event.participants,
      showHeatmap: false,
      myAvailability: [],
      notificationIsActive: false,
      notificationMessage: '',
      notificationTitle: '',
      showButtonAviability: 'none',
      showAvailabilityGrid: 'block',
    };
  }

  async componentWillMount() {
    const { curUser } = this.props;
    if (curUser) {
      let showHeatmap = false;
      let showAvailabilityGrid = 'block';
      let myAvailability = [];

      // find actual user particant record
      const isParticipant = this.state.participants.find(participant =>
        participant.userId === curUser._id,
      );

      // if curUser have aviability show heatMap
      if (isParticipant) {
        if (isParticipant.availability) {
          myAvailability = isParticipant.availability;
          if (myAvailability.length) {
            showHeatmap = true;
            showAvailabilityGrid = 'none';
          }
        }
      } else {
        showHeatmap = false;
        showAvailabilityGrid = 'none';
      }
      this.setState({ showHeatmap, showAvailabilityGrid, myAvailability });
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
    const { curUser } = this.props;
    const { name, avatar, _id: userId } = curUser;
    const participant = { name, avatar, userId };
    const event = update(this.state.event, { $set: this.state.event });
    const observerEvent = jsonpatch.observe(event);

    event.participants.push(participant);

    const eventParticipantsIds = update(this.state.eventParticipantsIds, {
      $push: [curUser._id],
    });
    const patches = jsonpatch.generate(observerEvent);
    const response = await this.props.cbEditEvent(patches, event._id);
    if (response) {
      this.sendEmailOwner(event);
      this.setState({ event, eventParticipantsIds, showAvailabilityGrid: 'block' });
    }
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
    const { curUser } = this.props;
    const { name } = curUser;
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
  closeGrid() {
    this.setState({ showHeatmap: true, showAvailabilityGrid: 'none' });
  }

  @autobind
  editAvail() {
    this.setState({ showHeatmap: false, showButtonAviability: 'none', showAvailabilityGrid: 'block' });
  }

  @autobind
  async submitAvailability(patches) {
    const { event, curUser } = this.props;
    const responseEvent = await this.props.cbEditEvent(patches, event._id);
    if (responseEvent) {
      const response = await fetch(`/api/events/${this.state.event._id}`, {
        credentials: 'same-origin',
      });
      let event;
      try {
        checkStatus(response);
        event = await parseJSON(response);
        const me = event.participants.find(participant =>
          participant.userId === curUser._id,
        );
        this.setState({ showHeatmap: true, event, participants: event.participants, myAvailability: me.availability });
      } catch (err) {
        console.log(err);
        this.setState({
          notificationIsActive: true,
          notificationMessage: 'Failed to update availability. Please try again later.',
          notificationTitle: 'Error!',
        });
        return;
      }

      this.setState({
        notificationIsActive: true,
        notificationMessage: 'Saved availability successfully.',
        notificationTitle: 'Success!',
      });
    }
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
      showHeatmap, participants,
      myAvailability, eventParticipantsIds,
      dates, showAvailabilityGrid } = this.state;
    console.log(showAvailabilityGrid);
    const { curUser } = this.props;
    const availability = participants.map(participant => participant.availability);
    let isOwner;
    const inlineStyles = {
      card: {
        availabilityGrid: {
          display: showAvailabilityGrid,
        },
      },
    };

    // check if the curUser is owner
    if (curUser !== undefined) {
      isOwner = event.owner === curUser._id;
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
              <div style={{ display: showAvailabilityGrid }}>
                <AvailabilityGrid
                  event={event}
                  dates={dates}
                  user={curUser}
                  availability={availability}
                  myAvailability={myAvailability}
                  submitAvail={this.submitAvailability}
                  closeGrid={this.closeGrid}
                />
              </div>
              {(Object.keys(curUser).length > 0) ?
                (eventParticipantsIds.indexOf(curUser._id) > -1) ?
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
          <ParticipantsList
            event={event}
            curUser={curUser}
            showInviteGuests={this.handleShowInviteGuestsDrawer}
          />
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
  cbEditEvent: React.PropTypes.func,
  curUser: React.PropTypes.object,
};

export default cssModules(EventDetailsComponent, styles);
