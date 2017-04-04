/* vendor dependencies */
import React, { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router';
import cssModules from 'react-css-modules';
import Masonry from 'react-masonry-component';
import autobind from 'autobind-decorator';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import Paper from 'material-ui/Paper';
import DateRangeIcon from 'material-ui/svg-icons/action/date-range';

/* external components */
import EventCard from '../../components/EventCard/EventCard';
import GuestInviteDrawer from '../../components/GuestInviteDrawer/GuestInviteDrawer';

/* styles */
import styles from './dashboard.css';

class Dashboard extends Component {
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
  handleNewEvent() {
    browserHistory.push('/event/new');
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
        <FloatingActionButton styleName="new-event-icon" secondary onClick={this.handleNewEvent} >
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

Dashboard.propTypes = {
  isAuthenticated: PropTypes.bool,
  cbOpenLoginModal: PropTypes.func,
  curUser: PropTypes.object,
  events: PropTypes.array,
  cbDeleteEvent: PropTypes.func,
  cbDeleteGuest: PropTypes.func,
  cbInviteEmail: React.PropTypes.func,
};

export default cssModules(Dashboard, styles);

