import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import autobind from 'autobind-decorator';
import { browserHistory } from 'react-router';
import { Notification } from 'react-notification';
import { Card, CardActions, CardTitle, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Divider from 'material-ui/Divider';
import Snackbar from 'material-ui/Snackbar';

import BestTimesDisplay from '../BestTimeDisplay/BestTimeDisplay';
import ParticipantsList from '../ParticipantsList/ParticipantsList';
import DeleteModal from '../DeleteModal/DeleteModal';
import { getCurrentUser } from '../../util/auth';
import styles from './event-card.css';


class EventCard extends Component {
  constructor(props) {
    super(props);

    const { event } = props;
    this.state = {
      participants: props.event.participants,
      event,
      curUser: {},
      snackBarMessage: '',
      notificationIsActive: false,
      notificationTitle: '',
      openSnackBar: false,
    };
  }

  async componentWillMount() {
    const curUser = await getCurrentUser();
    this.setState({ curUser });
  }

  @autobind
  redirectToEvent() {
    browserHistory.push(`/event/${this.state.event._id}`);
  }

  @autobind
  handleDelete(result) {
    if (result === true) {
      this.props.removeEventFromDashboard(this.state.event._id);
    } else {
      console.log('deleteEvent EvdentCard', result);
      this.setState({
        openSnackBar: true,
        notificationMessage: 'Failed to delete event. Please try again later.',
      });
    }
  }
  @autobind
  handleSnackBarRequestClose() {
    this.setState({
      openSnackBar: false,
    });
  }

  @autobind
  handleShowInviteGuestsDrawer() {
    const { event } = this.state;
    this.props.showInviteGuests(event);
  }

  render() {
    const { event, curUser, openSnackBar, snackBarMessage } = this.state;
    let isOwner;

    if (curUser !== undefined) {
      isOwner = event.owner === curUser._id;
    }

    const styles = {
      card: {
        cardTitle: {
          paddingBottom: 0,
          fontSize: '24px',
          paddingTop: 20,
          fontWeight: 300,
        },
        cardActions: {
          fontSize: '20px',
          paddingLeft: '5%',
          button: {
            color: '#F66036',
          },
        },
        divider: {
          width: '100%',
        },
      },
    };

    return (
      <Card style={styles.card} styleName="card">
        {
          isOwner ? <DeleteModal event={event} cb={this.handleDelete} /> : null
        }
        <CardTitle style={styles.card.cardTitle}>
          {event.name}
        </CardTitle>
        <CardText>
          <BestTimesDisplay event={event} disablePicker={false} />
          <ParticipantsList event={event} curUser={curUser} showInviteGuests={this.handleShowInviteGuestsDrawer} />
        </CardText>
        <Divider style={styles.card.divider} />
        <CardActions style={styles.card.cardActions}>
          <FlatButton style={styles.card.cardActions.button} onClick={this.redirectToEvent}>View Details</FlatButton>
        </CardActions>
        <Snackbar
          open={openSnackBar}
          message={snackBarMessage}
          action="Dimiss"
          autoHideDuration={3000}
          onActionTouchTap={this.handleSnackBarRequestClose}
          onRequestClose={this.handleSnackBarRequestClose}
        />
      </Card>
    );
  }
}

EventCard.propTypes = {
  event: React.PropTypes.object,
  removeEventFromDashboard: React.PropTypes.func,
  cb: React.PropTypes.func,
  showInviteGuests: React.PropTypes.func,
};

export default cssModules(EventCard, styles);
