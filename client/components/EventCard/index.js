import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import autobind from 'autobind-decorator';
import { browserHistory } from 'react-router';
import { Notification } from 'react-notification';
import { Card, CardActions, CardTitle, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Divider from 'material-ui/Divider';

import BestTimesDisplay from '../BestTimeDisplay';
import ParticipantsList from '../ParticipantsList';
import DeleteModal from '../DeleteModal';
import { getCurrentUser } from '../../util/auth';
import styles from './event-card.css';


class EventCard extends Component {
  constructor(props) {
    super(props);

    const { event } = props;
    this.state = {
      participants: props.event.participants,
      event,
      user: {},
      notificationMessage: '',
      notificationIsActive: false,
      open: false,
    };
  }

  async componentWillMount() {
    const user = await getCurrentUser();
    this.setState({ user });
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
    browserHistory.push(`/event/${this.state.event._id}`);
  }

  @autobind
  handleDelete(result) {
    if (result === true) {
      this.props.removeEventFromDashboard(this.state.event._id);
    } else {
      console.log('deleteEvent EvdentCard', result);
      this.setState({
        notificationIsActive: true,
        notificationMessage: 'Failed to delete event. Please try again later.',
      });
    }
  }

  render() {
    const { event, user } = this.state;
    let isOwner;

    if (user !== undefined) {
      isOwner = event.owner === user._id;
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
          <BestTimesDisplay event={event} curUser={user} />
          <ParticipantsList event={event} />
        </CardText>
        <Divider style={styles.card.divider} />
        <CardActions style={styles.card.cardActions}>
          <FlatButton style={styles.card.cardActions.button} onClick={this.redirectToEvent}>View Details</FlatButton>
        </CardActions>
        <Notification
          isActive={this.state.notificationIsActive}
          message={this.state.notificationMessage}
          action="Dismiss"
          title="Error!"
          onDismiss={() => this.setState({ notificationIsActive: false })}
          onClick={() => this.setState({ notificationIsActive: false })}
          activeClassName="notification-bar-is-active"
        />
      </Card>
    );
  }
}

EventCard.propTypes = {
  event: React.PropTypes.object,
  removeEventFromDashboard: React.PropTypes.func,
};

export default cssModules(EventCard, styles);
