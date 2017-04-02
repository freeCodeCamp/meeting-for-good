import React from 'react';
import autobind from 'autobind-decorator';
import cssModules from 'react-css-modules';
import { Card, CardTitle, CardText } from 'material-ui/Card';
import Snackbar from 'material-ui/Snackbar';
import DeleteModal from '../../components/DeleteModal/DeleteModal';
import AvailabilityGrid from '../AvailabilityGrid/AvailabilityGrid';
import styles from './event-details-component.css';
import ParticipantsList from '../../components/ParticipantsList/ParticipantsList';
import BestTimesDisplay from '../../components/BestTimeDisplay/BestTimeDisplay';

class EventDetailsComponent extends React.Component {
  constructor(props) {
    super(props);
    const eventParticipantsIds = props.event.participants.map(participant => participant.userId._id);
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
      showButtonAviability: 'none',
      showAvailabilityGrid: 'block',
      isParticipant: true,
      snackBarOpen: false,
      snackBarMsg: '',
    };
  }

  async componentWillMount() {
    const { curUser } = this.props;
    if (curUser) {
      let showHeatmap = false;
      let showAvailabilityGrid = 'block';
      let myAvailability = [];

      // find actual user particant record
      const isCurParticipant = this.state.participants.find(participant =>
        participant.userId._id === curUser._id,
      );
      // if curUser have aviability show heatMap
      if (isCurParticipant) {
        if (isCurParticipant.availability) {
          myAvailability = isCurParticipant.availability;
          if (myAvailability.length) {
            showHeatmap = true;
            showAvailabilityGrid = 'none';
          }
        }
      } else {
        showHeatmap = false;
        showAvailabilityGrid = 'block';
        this.setState({
          isParticipant: false,
          snackBarOpen: true,
          snackBarMsg: 'Please add your availability to join the event.',
        });
      }
      this.setState({ showHeatmap, showAvailabilityGrid, myAvailability });
    }
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

  async sendEmailOwner(event) {
    const response = this.props.cbHandleEmailOwner(event);
    if (!response) {
      console.log('sendEmailOwner error');
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
      const me = responseEvent.participants.find(participant =>
        participant.userId._id === curUser._id,
      );
      this.setState({
        showHeatmap: true,
        event: responseEvent,
        participants: responseEvent.participants,
        myAvailability: me.availability,
      });
      if (curUser._id !== event.owner) {
        await this.sendEmailOwner(responseEvent);
      }
      return responseEvent;
    }
    console.log('Error at EventDetailComponent submitAvailability');
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

  @autobind
  async handleDeleteGuest(guestToDelete) {
    const response = await this.props.cbDeleteGuest(guestToDelete);
    return response;
  }

  @autobind
  handleSnackBarRequestClose() {
    this.setState({
      snackBarOpen: false,
    });
  }

  render() {
    const {
      event,
      showHeatmap, participants, myAvailability,
      dates, showAvailabilityGrid, snackBarOpen, snackBarMsg } = this.state;
    const { curUser } = this.props;
    const availability = participants.map(participant => participant.availability);
    let isOwner;
    // check if the curUser is owner
    if (curUser !== undefined) {
      isOwner = event.owner === curUser._id;
    }

    const inLineStyles = {
      snackBar: {
        border: '5px solid #fffae6',
        contentSyle: {
          fontSize: '16px',
          textAlign: 'center',
        },
      },
    };

    return (
      <div styleName="wrapper">
        <div styleName="cardWrapper">
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
                </div>
              }
              <br />
              <ParticipantsList
                event={event}
                curUser={curUser}
                showInviteGuests={this.handleShowInviteGuestsDrawer}
                cbDeleteGuest={this.handleDeleteGuest}
              />
            </CardText>
          </Card>
        </div>
        <Snackbar
          style={inLineStyles.snackBar}
          bodyStyle={{ height: 'flex' }}
          contentStyle={inLineStyles.snackBar.contentSyle}
          open={snackBarOpen}
          message={snackBarMsg}
          action="dismiss"
          autoHideDuration={5000}
          onRequestClose={this.handleSnackBarRequestClose}
          onActionTouchTap={this.handleSnackBarRequestClose}
        />
      </div>
    );
  }
}

EventDetailsComponent.propTypes = {
  event: React.PropTypes.object,
  showInviteGuests: React.PropTypes.func,
  cbDeleteEvent: React.PropTypes.func,
  cbEditEvent: React.PropTypes.func,
  curUser: React.PropTypes.object,
  cbHandleEmailOwner: React.PropTypes.func,
  cbDeleteGuest: React.PropTypes.func,
};

export default cssModules(EventDetailsComponent, styles);
