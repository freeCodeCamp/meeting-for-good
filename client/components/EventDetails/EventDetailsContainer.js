import React from 'react';
import { browserHistory } from 'react-router';
import fetch from 'isomorphic-fetch';
import { Notification } from 'react-notification';
import moment from 'moment';
import autobind from 'autobind-decorator';
import nprogress from 'nprogress';
import jsonpatch from 'fast-json-patch';
import update from 'react-addons-update';
import EventDetails from './EventDetailsPresentation';
import { checkStatus, parseJSON } from '../../util/fetch.util';
import { getCurrentUser } from '../../util/auth';

export default class EventDetailsContainer extends React.Component {
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
      event: {},
      ranges: [],
      dates: [],
      user: {},
      eventParticipantsIds: [],
      myAvailability: [],
      participants: [],
      showHeatmap: false,
      notificationMessage: '',
      notificationIsActive: false,
    };
  }

  async componentWillMount() {
    const { params } = this.props;
    const response = await fetch(`/api/events/${params.uid}`, {
      credentials: 'same-origin',
    });
    let event;
    try {
      checkStatus(response);
      event = await parseJSON(response);
    } catch (err) {
      console.log('err at componentWillMount EventDetail', err);
      this.setState({
        notificationIsActive: true,
        notificationMessage: 'Failed to load event. Please try again later.',
      });
      window.location.href = '/';
      return;
    }

    const eventParticipantsIds = event.participants.map(participant =>
      participant.userId,
    );

    const ranges = event.dates.map(({ fromDate, toDate }) => ({
      from: new Date(fromDate),
      to: new Date(toDate),
    }));

    const dates = event.dates.map(({ fromDate, toDate }) => ({
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
    }));

    console.log(event);
    this.setState({
      event,
      eventParticipantsIds,
      ranges,
      dates,
      participants: event.participants,
    });

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
    this.generateBestDatesAndTimes(this.state.event);
  }

  @autobind
  editAvail() {
    this.setState({ showHeatmap: false }, () => {
      document.getElementById('enterAvailButton').click();
    });
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
    }

    this.setState({ event, eventParticipantsIds });
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
    this.setState({
      showHeatmap: true,
      myAvailability,
      event,
      participants: event.participants,
    });
  }

  generateBestDatesAndTimes(event) {
    const availability = [];
    const overlaps = [];
    const displayTimes = {};
    const formatStr = this.state.days ? 'dddd' : 'DD MMM';

    event.participants.forEach((user) => {
      if (user.availability !== undefined) availability.push(user.availability);
    });

    if (availability.length <= 1) return;

    for (let i = 0; i < availability[0].length; i++) {
      const current = availability[0][i];
      let count = 0;
      for (let j = 0; j < availability.length; j++) {
        for (let k = 0; k < availability[j].length; k++) {
          if (availability[j][k][0] === current[0]) {
            count += 1;
          }
        }
      }
      if (count === availability.length) overlaps.push(current);
    }


    if (overlaps.length === 0) {
      this.setState({ displayTimes });
      return;
    }

    let index = 0;
    for (let i = 0; i < overlaps.length; i++) {
      if (overlaps[i + 1] !== undefined && overlaps[i][1] !== overlaps[i + 1][0]) {
        if (displayTimes[moment(overlaps[index][0]).format(formatStr)] !== undefined) {
          displayTimes[moment(overlaps[index][0]).format(formatStr)].hours.push(
            `${moment(overlaps[index][0]).format('h:mm a')} to ${moment(overlaps[i][1]).format('h:mm a')}`,
          );
        } else {
          displayTimes[moment(overlaps[index][0]).format(formatStr)] = {
            hours: [`${moment(overlaps[index][0]).format('h:mm a')} to ${moment(overlaps[i][1]).format('h:mm a')}`],
          };
        }
        index = i + 1;
      } else if (overlaps[i + 1] === undefined) {
        if (displayTimes[moment(overlaps[index][0]).format(formatStr)] !== undefined) {
          displayTimes[moment(overlaps[index][0]).format(formatStr)].hours.push(
            `${moment(overlaps[index][0]).format('h:mm a')} to ${moment(overlaps[i][1]).format('h:mm a')}`,
          );
        } else {
          displayTimes[moment(overlaps[index][0]).format(formatStr)] = {
            hours: [`${moment(overlaps[index][0]).format('h:mm a')} to ${moment(overlaps[i][1]).format('h:mm a')}`],
          };
        }
      }
    }

    this.setState({ displayTimes });
  }

  @autobind
  async deleteEvent() {
    nprogress.configure({ showSpinner: false });
    nprogress.start();
    const response = await fetch(`/api/events/${this.state.event._id}`, {
      credentials: 'same-origin', method: 'DELETE',
    });

    try {
      checkStatus(response);
    } catch (err) {
      console.log(err);
      this.setState({
        notificationIsActive: true,
        notificationMessage: 'Failed to delete event. Please try again later.',
        notificationTitle: 'Error!',
        showEmail: false,
      });
      return;
    } finally {
      nprogress.done();
    }

    this.setState({
      notificationIsActive: true,
      notificationMessage: 'Event successfully deleted!',
      notificationTitle: '',
      showEmail: false,
    });

    browserHistory.push('/dashboard');
  }

  render() {
    const {
      displayTimes,
      user,
      participants,
      eventParticipantsIds,
      showHeatmap,
      dates,
      myAvailability,
      event,
    } = this.state;

    const bestTimes = displayTimes;
    let isBestTime;

    if (bestTimes !== undefined) {
      if (Object.keys(bestTimes).length > 0) isBestTime = true;
      else isBestTime = false;
    } else isBestTime = false;

    const childProps = {
      bestTimes,
      isBestTime,
      user,
      participants,
      eventParticipantsIds,
      showHeatmap,
      dates,
      myAvailability,
      event,
    };

    if (Object.keys(event).length) {
      return (
        <EventDetails
          deleteEvent={this.deleteEvent}
          joinEvent={this.joinEvent}
          submitAvailability={this.submitAvailability}
          editAvail={this.editAvail}
          {...childProps}
        />
      );
    }

    return (
      <Notification
        isActive={this.state.notificationIsActive}
        message={this.state.notificationMessage}
        action="Dismiss"
        title="Error!"
        onDismiss={() => this.setState({ notificationIsActive: false })}
        onClick={() => this.setState({ notificationIsActive: false })}
        activeClassName="notification-bar-is-active"
        dismissAfter={10000}
      />
    );
  }
}

EventDetailsContainer.propTypes = {
  params: React.PropTypes.shape({
    uid: React.PropTypes.string,
  }),
};
