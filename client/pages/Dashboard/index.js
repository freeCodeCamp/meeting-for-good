/* vendor dependencies */
import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import cssModules from 'react-css-modules';
import Masonry from 'react-masonry-component';
import autobind from 'autobind-decorator';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import Paper from 'material-ui/Paper';
import DateRangeIcon from 'material-ui/svg-icons/action/date-range';
import PropTypes from 'prop-types';

/* external components */
import EventCard from '../../components/EventCard/EventCard';
import GuestInviteDrawer from '../../components/GuestInviteDrawer/GuestInviteDrawer';

/* styles */
import styles from './dashboard.css';

class Dashboard extends Component {

  @autobind
  static handleNewEvent() {
    browserHistory.push('/event/new');
  }

  constructor(props) {
    super(props);
    this.state = {
      events: [],
      count: 0,
      openDrawer: false,
      eventToInvite: {},
      curUser: {},
    };
  }

  async componentWillMount() {
    const { isAuthenticated, curUser, events } = this.props;
    if (isAuthenticated === false) {
      this.props.cbOpenLoginModal('/dashboard');
    } else {
      this.setState({ curUser, events });
    }
  }

  async componentWillReceiveProps(nextProps) {
    const { showPastEvents, isAuthenticated, curUser, events } = nextProps;
    if (isAuthenticated) {
      this.setState({ showPastEvents, events, curUser });
    }
  }

  @autobind
  async handleDeleteEvent(id) {
    await this.props.cbDeleteEvent(id);
  }

  @autobind
  handleInviteGuests(event) {
    this.setState({ openDrawer: true, eventToInvite: event });
  }

  @autobind
  handleCbGuestInviteDrawer(open) {
    this.setState({ openDrawer: open });
  }

  @autobind
  async handleDeleteGuest(guestToDelete) {
    const response = await this.props.cbDeleteGuest(guestToDelete);
    return response;
  }

  @autobind
  async HandleInviteEmail(guestId, event, curUser) {
    const response = await this.props.cbInviteEmail(guestId, event, curUser);
    return response;
  }

  render() {
    const { events, curUser, openDrawer, eventToInvite } = this.state;
    return (
      <Paper zDepth={0} styleName="wrapper">
        {/* New Event Icon */}
        <FloatingActionButton styleName="new-event-icon" secondary onClick={this.constructor.handleNewEvent} >
          <ContentAdd />
        </FloatingActionButton>
        {/* Card Template */}
        {events.length !== 0 ?
          <Masonry>
            {events.map(event => (
              <EventCard
                key={event._id}
                event={event}
                cbDeleteEvent={this.handleDeleteEvent}
                curUser={curUser}
                showInviteGuests={this.handleInviteGuests}
                cbDeleteGuest={this.handleDeleteGuest}
              />
            ))}
          </Masonry> :
          <div styleName="no-select-container">
            <h4 styleName="no-select">
              You have no current scheduled events.
            </h4>
            <DateRangeIcon styleName="no-selectIcon" />
          </div>
        }
        <GuestInviteDrawer
          open={openDrawer}
          event={eventToInvite}
          curUser={curUser}
          cb={this.handleCbGuestInviteDrawer}
          cbInviteEmail={this.HandleInviteEmail}
        />
      </Paper>
    );
  }
}

Dashboard.defaultProps = {
  isAuthenticated: false,
  cbOpenLoginModal: undefined,
  curUser: undefined,
  events: undefined,
  cbDeleteEvent: undefined,
  cbInviteEmail: undefined,
};

Dashboard.propTypes = {
  isAuthenticated: PropTypes.bool,
  cbOpenLoginModal: PropTypes.func,

  // Current user
  curUser: PropTypes.shape({
    _id: PropTypes.string,      // Unique user id
    name: PropTypes.string,     // User name
    avatar: PropTypes.string,   // URL to image representing user(?)
  }),

  events: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
      owner: PropTypes.string,
      active: PropTypes.bool,
      selectedTimeRange: PropTypes.array,
      dates: PropTypes.arrayOf(PropTypes.shape({
        fromDate: PropTypes.string,
        toDate: PropTypes.string,
        _id: PropTypes.string,
      })),
      participants: PropTypes.arrayOf(PropTypes.shape({
        userId: PropTypes.shape({
          id: PropTypes.string,
          avatar: PropTypes.string,
          name: PropTypes.string,
          emails: PropTypes.arrayOf(PropTypes.string),
        }),
        _id: PropTypes.string,
        status: PropTypes.oneOf([0, 1, 2, 3]),
        emailUpdate: PropTypes.bool,
        ownerNotified: PropTypes.bool,
        availability: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
      })),
    }),
  ),

  cbDeleteEvent: PropTypes.func,
  cbInviteEmail: PropTypes.func,
};

export default cssModules(Dashboard, styles);

