import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import autobind from 'autobind-decorator';
import { browserHistory } from 'react-router';
import { Card, CardActions, CardTitle, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Divider from 'material-ui/Divider';
import PropTypes from 'prop-types';

import BestTimesDisplay from '../BestTimeDisplay/BestTimeDisplay';
import ParticipantsList from '../ParticipantsList/ParticipantsList';
import DeleteModal from '../DeleteModal/DeleteModal';
import styles from './event-card.css';
import { isEvent, isCurUser } from '../../util/commonPropTypes';

class EventCard extends Component {
  constructor(props) {
    super(props);

    const { event, curUser } = props;
    this.state = {
      participants: props.event.participants,
      event,
      curUser,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ event: nextProps.event });
  }

  @autobind
  redirectToEvent() {
    browserHistory.push(`/event/${this.state.event._id}`);
  }

  @autobind
  handleDelete(id) {
    this.props.cbDeleteEvent(id);
  }

  @autobind
  handleShowInviteGuestsDrawer() {
    const { event } = this.state;
    this.props.showInviteGuests(event);
  }

  @autobind
  async handleDeleteGuest(guestToDelete) {
    const nEvent = await this.props.cbDeleteGuest(guestToDelete);
    this.setState({ event: nEvent });
    return nEvent;
  }

  render() {
    const { event, curUser } = this.state;
    let isOwner;

    if (curUser !== undefined) {
      isOwner = event.owner === curUser._id;
    }

    return (
      <Card styleName="card">
        {
          isOwner ? <DeleteModal event={event} cbEventDelete={this.handleDelete} /> : null
        }
        <CardTitle styleName="cardTitle">
          {event.name}
        </CardTitle>
        <CardText>
          <BestTimesDisplay event={event} disablePicker={false} />
          <ParticipantsList
            event={event}
            curUser={curUser}
            showInviteGuests={this.handleShowInviteGuestsDrawer}
            cbDeleteGuest={this.handleDeleteGuest}
          />
        </CardText>
        <Divider style={styles.card.divider} />
        <CardActions styleName="cardActions">
          <FlatButton styleName="viewDetailsButton" onClick={this.redirectToEvent}>View Details</FlatButton>
        </CardActions>
      </Card>
    );
  }
}

EventCard.defaultProps = {
  event: () => { console.log('event prop validation not set!'); },
  curUser: () => { console.log('curUser prop validation not set!'); },
};

EventCard.propTypes = {
  cbDeleteEvent: PropTypes.func.isRequired,
  showInviteGuests: PropTypes.func.isRequired,

  // Current user
  curUser: isCurUser,

  cbDeleteGuest: PropTypes.func.isRequired,

  // Event containing list of event participants
  event: isEvent,
};

export default cssModules(EventCard, styles);
