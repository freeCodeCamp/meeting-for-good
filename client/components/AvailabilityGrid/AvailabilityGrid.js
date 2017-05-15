import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import _ from 'lodash';
import moment from 'moment';
import autobind from 'autobind-decorator';
import jsonpatch from 'fast-json-patch';
import jz from 'jstimezonedetect';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import PropTypes from 'prop-types';
import chroma from 'chroma-js';

import CellGrid from '../CellGrid/CellGrid';
import SnackBarGrid from '../SnackBarGrid/SnackBarGrid';
import { getDaysBetween } from '../../util/dates.utils';
import getTimesBetween from '../../util/times.utils';
import enteravailGif from '../../assets/enteravail.gif';
import { loadEventFull } from '../../util/events';
import styles from './availability-grid.css';

class AvailabilityGrid extends Component {

  static flattenedAvailability(event) {
    const flattenedAvailability = {};
    event.participants.forEach((participant) => {
      flattenedAvailability[participant.userId._id] =
        participant.availability.map((avail) => {
          // correct the milliseconds to zero since its a unecessary information
          const dateCorrect = moment(avail[0]).second(0).millisecond(0);
          return dateCorrect.toJSON();
        });
    });
    return flattenedAvailability;
  }

  static createGridComplete(allDates, allTimes, event) {
    const grid = [];
    const flattenedAvailability = AvailabilityGrid.flattenedAvailability(event);
    allDates.forEach((date) => {
      const dateMoment = moment(date);
      dateMoment.hour(0).minute(0).second(0).millisecond(0);
      grid.push({
        date: dateMoment,
        quarters: allTimes.map((quarter) => {
          // construct the time / date value for each cell
          const dateHourForCell = moment(dateMoment)
            .hour(moment(quarter).hour())
            .minute(moment(quarter).minute());
          const guests = [];
          const notGuests = [];
          event.participants.forEach((participant) => {
            const availForThatParticipant = flattenedAvailability[participant.userId._id];
            const guest = {};
            guest[participant.userId._id] = participant.userId.name;
            if (availForThatParticipant.indexOf(dateHourForCell.toJSON()) > -1) {
              guests.push(guest);
            } else {
              notGuests.push(guest);
            }
          });
          return {
            time: dateHourForCell.toDate(),
            participants: guests,
            notParticipants: notGuests,
          };
        }),
      });
    });
    // pop the last quarter of each day
    grid.forEach(date => date.quarters.pop());
    return grid;
  }

  static generateHeatMapBackgroundColors(quantOfParticipants) {
    quantOfParticipants = (quantOfParticipants > 2) ? quantOfParticipants : 2;
    const colors = chroma.scale(['wheat', 'olive']);
    return colors.colors(quantOfParticipants);
  }

  constructor(props) {
    super(props);
    this.state = {
      openModal: false,
      grid: {},
      backgroundColors: [],
      openSnackBar: false,
      snackBarGuests: [],
      snackBarNoGuests: [],
      showHeatmap: false,
      mouseDown: false,
      editOperation: 'add',
      event: {},
    };
  }

  componentWillMount() {
    const { event, dates, showHeatmap } = this.props;
    const { createGridComplete, generateHeatMapBackgroundColors } = this.constructor;

    // construct all dates range to load at the grid
    const allDates = _.flatten(dates.map(({ fromDate, toDate }) =>
      getDaysBetween(fromDate, toDate),
    ));

    // construct all times range to load a the grid
    const allTimes = _.flatten(
      [dates[0]].map(({ fromDate, toDate }) =>
        getTimesBetween(fromDate, toDate),
      ),
    );

    const grid = createGridComplete(allDates, allTimes, event);
    const backgroundColors = generateHeatMapBackgroundColors(event.participants.length);

    this.setState({ grid, backgroundColors, allTimes, showHeatmap, allDates, event });
  }

  componentWillReceiveProps(nextProps) {
    const { showHeatmap, event } = nextProps;
    this.setState({ showHeatmap, event });
  }

  editParticipantToCellGrid(quarter, operation, rowIndex, columnIndex) {
    const { curUser } = this.props;
    const stateCopy = Object.assign({}, this.state);
    const { grid } = stateCopy;
    const nQuarter = Object.assign({}, quarter);
    if (operation === 'add') {
      const temp = nQuarter.notParticipants.splice(
        _.findIndex(nQuarter.notParticipants, curUser._id), 1);
      nQuarter.participants.push(temp[0]);
    }
    if (operation === 'remove') {
      const temp = nQuarter.participants.splice(
        _.findIndex(nQuarter.participants, curUser._id), 1);
      nQuarter.notParticipants.push(temp[0]);
    }
    grid[rowIndex].quarters[columnIndex] = nQuarter;
    this.setState(stateCopy);
  }

  @autobind
  async submitAvailability() {
    const { curUser } = this.props;
    const { grid } = this.state;
    const availability = [];
    grid.forEach((row) => {
      row.quarters.forEach((quarter) => {
        if (_.findIndex(quarter.participants, curUser._id) > -1) {
          const from = moment(quarter.time)._d;
          const to = moment(quarter.time).add(15, 'm')._d;
          availability.push([from, to]);
        }
      });
    });

    // again i need to call the full event to edit... since he dont the
    // info that maybe have a guest "deleted"
    const eventToEdit = await loadEventFull(this.state.event._id);
    const event = JSON.parse(JSON.stringify(eventToEdit));
    const observerEvent = jsonpatch.observe(event);
     // first check if cur exists as a participant
     // if is not add the curUser as participant
    const isParticipant = event.participants.filter(
      participant => participant.userId._id === curUser._id,
    );
    if (isParticipant.length === 0) {
      const { _id: userId } = curUser;
      const participant = { userId };
      event.participants.push(participant);
    }
    event.participants = event.participants.map((participant) => {
      if (participant.userId._id === curUser._id || participant.userId === curUser._id) {
        participant.availability = availability;
        if (availability.length === 0) {
          participant.status = 2;
        } else {
          participant.status = 3;
        }
      }
      return participant;
    });

    const patches = jsonpatch.generate(observerEvent);
    await this.props.submitAvail(patches);
  }

  @autobind
  handleCellMouseDown(ev, quarter, rowIndex, columnIndex) {
    ev.preventDefault();
    const { showHeatmap } = this.state;
    // is at showing heatMap then ignore click
    if (showHeatmap) {
      return;
    }
    const { curUser } = this.props;
    let editOperation = '';
    if (_.findIndex(quarter.participants, curUser._id) > -1) {
      editOperation = 'remove';
    }
    if (_.findIndex(quarter.notParticipants, curUser._id) > -1) {
      editOperation = 'add';
    }
    this.setState({ mouseDown: true, editOperation },
      this.editParticipantToCellGrid(quarter, editOperation, rowIndex, columnIndex));
  }

  @autobind
  handleCellMouseOver(ev, quarter, rowIndex, columnIndex) {
    ev.preventDefault();
    const { showHeatmap, mouseDown, editOperation } = this.state;
    const { curUser } = this.props;
    if (!showHeatmap) {
      if (mouseDown) {
        if (_.findIndex(quarter.participants, curUser._id) > -1 && editOperation === 'remove') {
          this.editParticipantToCellGrid(quarter, 'remove', rowIndex, columnIndex);
        }
        if (_.findIndex(quarter.notParticipants, curUser._id) > -1 && editOperation === 'add') {
          this.editParticipantToCellGrid(quarter, 'add', rowIndex, columnIndex);
        }
      }
    } else {
      const snackBarGuests = quarter.participants.map(participant => Object.values(participant));
      const snackBarNoGuests =
        quarter.notParticipants.map(participant => Object.values(participant));
      this.setState({ openSnackBar: true, snackBarGuests, snackBarNoGuests });
    }
  }

  @autobind
  handleCellMouseUp(ev) {
    ev.preventDefault();
    this.setState({ mouseDown: false });
  }

  @autobind
  handleCellMouseLeave(ev) {
    ev.preventDefault();
    const { showHeatmap } = this.state;
    if (!showHeatmap) {
      return;
    }
    this.setState({ openSnackBar: false });
  }

  @autobind
  handleCancelBtnClick() {
    const { allDates, allTimes, event } = this.state;
    const { createGridComplete } = this.constructor;
    const grid =  createGridComplete(allDates, allTimes, event);
    this.setState({ grid });
    this.props.closeEditorGrid();
  }

  renderDialog() {
    const { openModal } = this.state;
    const actions = [
      <FlatButton
        label="close"
        primary
        onTouchTap={() => this.setState({ openModal: false })}
      />,
    ];
    const inlineStyles = {
      modal: {
        content: {
          width: '550px',
          maxWidth: '550px',
        },
        bodyStyle: {
          paddingTop: 10,
          fontSize: '25px',
        },
      },
    };

    return (
      <Dialog
        contentStyle={inlineStyles.modal.content}
        bodyStyle={inlineStyles.modal.bodyStyle}
        actions={actions}
        modal
        open={openModal}
      >
        <h4>This is how you can enter and remove your availablity:</h4>
        <img src={enteravailGif} alt="entering availablity gif" />
      </Dialog>
    );
  }

  renderGridHours() {
    const { allTimes } = this.state;
    // array only with full hours thats will be used to display at grid
    const hourTime = allTimes
      .filter(time => moment(time).minute() === 0);
    let offSet = 0;
    // calculate the numbers of cells to offset the hours grid
    // since we only whant display the full hours
    if (moment(allTimes[0]).minutes() !== 0) {
      offSet = 4 - (moment(allTimes[0]).minutes() / 15);
    }
    const style = { margin: `0 0 0 ${75 + (offSet * 12)}px` };
    const colTitles = hourTime.map(time => (
      <p
        key={time}
        styleName="grid-hour"
      >{moment(time).format('h a')}</p>
    ));
    // delete the last hour for layout requirements
    colTitles.pop();
    const timesTitle = (
      <div id="timesTitle" styleName="timesTitle" style={style}>
        {colTitles}
      </div>
    );
    return timesTitle;
  }

  renderGridRow(quarters, rowIndex) {
    const { backgroundColors, showHeatmap } = this.state;
    const { curUser } = this.props;
    return quarters.map((quarter, columnIndex) => (
      <CellGrid
        heatMapMode={showHeatmap}
        key={moment(quarter.time)._d}
        date={quarter.time}
        backgroundColors={backgroundColors}
        participants={quarter.participants}
        onMouseOver={ev => this.handleCellMouseOver(ev, quarter, rowIndex, columnIndex)}
        onMouseLeave={ev => this.handleCellMouseLeave(ev)}
        onMouseDown={ev => this.handleCellMouseDown(ev, quarter, rowIndex, columnIndex)}
        onMouseUp={ev => this.handleCellMouseUp(ev)}
        curUser={curUser}
        rowIndex={rowIndex}
        columnIndex={columnIndex}
        heightlightedUser={this.props.heightlightedUser}
      />
    ),
    );
  }

  renderGrid() {
    const { grid } = this.state;
    return (
      <div>
        {this.renderGridHours()}
        {
          grid.map((row, rowIndex) => (
            <div key={moment(row.date).format('Do MMM ddd')} styleName="column">
              <div styleName="row">
                <div styleName="date-cell">
                  {moment(row.date).format('Do MMM ddd')}
                </div>
                {this.renderGridRow(row.quarters, rowIndex)}
              </div>
            </div>
          ))
        }
      </div>
    );
  }

  render() {
    const { snackBarGuests, snackBarNoGuests, openSnackBar, showHeatmap } = this.state;
    return (
      <div styleName="column">
        <div styleName="row">
          <FlatButton
            primary
            onClick={() => this.setState({ openModal: true })}
          >
            How do I use the grid?
          </FlatButton>
        </div>
        {this.renderGrid()}
        <div styleName="info">
          <p>
            <em>Each time slot represents 15 minutes.</em>
          </p>
          <p>
            <em>
              Displaying all times in your local timezone: {jz.determine().name()}
            </em>
          </p>
        </div>
        <br />
        <div styleName="actionButtonsWrapper">
          {showHeatmap ?
            <RaisedButton
              primary
              label="Edit Availability"
              onClick={this.props.editAvail}
            />
            :
            <div>
              <RaisedButton
                primary
                label="Submit"
                onClick={this.submitAvailability}
              />
              <RaisedButton
                primary
                label="Cancel"
                styleName="cancelButton"
                onClick={this.handleCancelBtnClick}
              />
            </div>
          }
        </div>
        <SnackBarGrid
          guests={snackBarGuests}
          noGuests={snackBarNoGuests}
          openSnackBar={openSnackBar}
        />
        {this.renderDialog()}
      </div>
    );
  }
}

AvailabilityGrid.defaultProps = {
  showHeatmap: false,
  editAvail: () => { console.log('ediAvail func not passed in!'); },
  closeEditorGrid: () => { console.log('closeGrid func not passed in!'); },
  submitAvail: () => { console.log('submitAvail func not passed in!'); },
  heightlightedUser: '',
};

AvailabilityGrid.propTypes = {

  // Function to run when availability for current user is ready to be updated
  submitAvail: PropTypes.func,

  // Function to run to switch from heat map to availability editing
  editAvail: PropTypes.func,

  // Function to run when user wishes to cancel availability editing
  closeEditorGrid: PropTypes.func,

  // List of dates ranges for event
  dates: PropTypes.arrayOf(PropTypes.shape({
    fromDate: PropTypes.instanceOf(Date),
    toDate: PropTypes.instanceOf(Date),
  })).isRequired,

  // True if grid is showing heat map
  showHeatmap: PropTypes.bool,
  // Event containing list of event participants
  event: PropTypes.shape({
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
  }).isRequired,
  // Current user
  curUser: PropTypes.shape({
    _id: PropTypes.string,      // Unique user id
    name: PropTypes.string,     // User name
    avatar: PropTypes.string,   // URL to image representing user(?)
  }).isRequired,
  heightlightedUser: PropTypes.string,
};

export default cssModules(AvailabilityGrid, styles);
