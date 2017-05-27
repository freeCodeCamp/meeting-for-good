import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import _ from 'lodash';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
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
import enteravailGif from '../../assets/enteravail.gif';
import { loadEventFull } from '../../util/events';
import styles from './availability-grid.css';

const moment = extendMoment(Moment);

class AvailabilityGrid extends Component {

  static generateRange(num1, num2) {
    let rangeStart;
    let rangeEnd;
    const range = [];

    if (num1 > num2) {
      rangeStart = num2;
      rangeEnd = num1;
    } else {
      rangeStart = num1;
      rangeEnd = num2;
    }

    for (let i = rangeStart; i <= rangeEnd; i += 1) {
      range.push(i);
    }

    return range;
  }

  static flattenedAvailability(event) {
    const flattenedAvailability = {};
    event.participants.forEach((participant) => {
      flattenedAvailability[participant.userId._id] =
        participant.availability.map((avail) => {
          // correct the milliseconds to zero since its a unecessary information
          const dateCorrect = moment(avail[0]).startOf('minute');
          return dateCorrect.toJSON();
        });
    });
    return flattenedAvailability;
  }

  static createTimesRange(dates) {
    // construct all times range to load a the grid
    const startDate = moment(dates[0].fromDate);
    const year = startDate.get('year');
    const month = startDate.get('month');
    const date = startDate.get('date');

    const endDate = moment(dates[0].toDate);
    const hour = endDate.get('hour');
    const minute = endDate.get('minute');
    const endDateToRange = moment().set({ year, month, date, hour, minute }).startOf('minute');
    const dateRange = moment.range(startDate, endDateToRange);
    return Array.from(dateRange.by('minutes', { exclusive: true, step: 15 }));
  }

  static createDatesRange(dates) {
    let datesRanges = dates.map((date) => {
      const range = moment.range(moment(date.fromDate).startOf('date'), moment(date.toDate).startOf('date'));
      return Array.from(range.by('days', { step: 1 }));
    });
    datesRanges = _.flatten(datesRanges);
    datesRanges.sort((a, b) => {
      const x = a.clone().unix();
      const y = b.clone().unix();
      return x - y;
    });
    return datesRanges;
  }

  /**
   *
   * @param {array} allDates
   * @param {array} allTimes
   * @param {Object} event
   */
  static createGridComplete(allDates, allTimes, event) {
    const grid = [];
    const flattenedAvailability = AvailabilityGrid.flattenedAvailability(event);
    allDates.forEach((date) => {
      const dateMoment = date;
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
    return grid;
  }

  static generateHeatMapBackgroundColors(participants) {
    let quantOfParticipants = participants.filter(
      participant => participant.availability.length > 0).length;
    quantOfParticipants = (quantOfParticipants > 2) ? quantOfParticipants : 2;
    if (quantOfParticipants < 3) {
      return chroma.scale(['#AECDE0', '#8191CD']).colors(quantOfParticipants);
    }
    if (quantOfParticipants < 5) {
      return chroma.scale(['#AECDE0', '#5456BA']).colors(quantOfParticipants);
    }
    return chroma.scale(['#AECDE0', '#3E38B1']).colors(quantOfParticipants);
  }

  /**
   *
   * @param {*} quarter
   * @param {*} operation
   * @param {*} cellRowIndex
   * @param {*} cellColumnIndex
   * @param {*} cellInitialRow
   * @param {*} cellInitialColumn
   * @param {*} curUser
   * @param {*} grid
   */
  static editParticipantToCellGrid(
    quarter, operation,
    cellRowIndex,
    cellColumnIndex,
    cellInitialRow,
    cellInitialColumn,
    curUser, grid) {
    const nGrid = _.cloneDeep(grid);
    const rows = AvailabilityGrid.generateRange(cellInitialRow, cellRowIndex);
    const columns = AvailabilityGrid.generateRange(cellInitialColumn, cellColumnIndex);

    rows.forEach((row) => {
      columns.forEach((cell) => {
        const nQuarter = nGrid[row].quarters[cell];
        const indexAtParticipant = _.findIndex(nQuarter.participants, curUser._id);
        const indexAtNotParticipant = _.findIndex(nQuarter.notParticipants, curUser._id);
        if (operation === 'add' && indexAtParticipant === -1) {
          if (indexAtNotParticipant > -1) {
            const temp = nQuarter.notParticipants.splice(indexAtNotParticipant, 1);
            nQuarter.participants.push(temp[0]);
          } else {
            const temp = {};
            temp[curUser._id] = curUser.name;
            nQuarter.participants.push(temp);
          }
        }
        if (operation === 'remove' && indexAtNotParticipant === -1) {
          if (indexAtParticipant > -1) {
            const temp = nQuarter.participants.splice(indexAtParticipant, 1);
            nQuarter.notParticipants.push(temp[0]);
          } else {
            const temp = {};
            temp[curUser._id] = curUser.name;
            nQuarter.notParticipants.push(temp);
          }
        }
      });
    });
    return nGrid;
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
      editOperation: null,
      cellInitialRow: null,
      cellInitialColumn: null,
      event: {},
    };
  }

  componentWillMount() {
    const { event, dates, showHeatmap } = this.props;
    const {
      createGridComplete, generateHeatMapBackgroundColors,
      createTimesRange, createDatesRange,
    } = this.constructor;

    const allDates = createDatesRange(dates);
    const allTimes = createTimesRange(dates);
    const grid = createGridComplete(allDates, allTimes, event);
    const backgroundColors = generateHeatMapBackgroundColors(event.participants);

    this.setState({ grid, backgroundColors, allTimes, showHeatmap, allDates, event });
  }

  componentWillReceiveProps(nextProps) {
    const { event, dates, showHeatmap } = nextProps;
    const {
      createGridComplete, generateHeatMapBackgroundColors,
      createTimesRange, createDatesRange,
    } = this.constructor;

    const allDates = createDatesRange(dates);
    const allTimes = createTimesRange(dates);
    const grid = createGridComplete(allDates, allTimes, event);
    const backgroundColors = generateHeatMapBackgroundColors(event.participants);

    this.setState({ grid, backgroundColors, allTimes, showHeatmap, allDates, event });
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

    // need to call the full event to edit... since he dont the
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
    const { showHeatmap, grid } = this.state;
    const { curUser } = this.props;
    const { editParticipantToCellGrid } = this.constructor;
    // is at showing heatMap then ignore click
    if (showHeatmap) {
      return;
    }
    const editOperation = (_.findIndex(quarter.participants, curUser._id) > -1) ? 'remove' : 'add';
    this.setState({
      mouseDown: true,
      editOperation,
      cellInitialColumn: columnIndex,
      cellInitialRow: rowIndex,
      grid: editParticipantToCellGrid(
        quarter, editOperation, rowIndex,
        columnIndex, rowIndex, columnIndex, curUser, grid),
    });
  }

  @autobind
  handleCellMouseOver(ev, quarter, rowIndex, columnIndex) {
    ev.preventDefault();
    const { showHeatmap, mouseDown, editOperation, cellInitialRow,
      cellInitialColumn } = this.state;
    const { curUser } = this.props;
    const { editParticipantToCellGrid } = this.constructor;
    if (!showHeatmap) {
      if (mouseDown) {
        this.setState(oldState => ({
          grid: editParticipantToCellGrid(
            quarter, editOperation, rowIndex,
            columnIndex, cellInitialRow,
            cellInitialColumn, curUser, oldState.grid),
        }),
        );
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
    this.setState({
      mouseDown: false, cellInitialColumn: null, cellInitialRow: null, editOperation: null,
    });
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
    const grid = createGridComplete(allDates, allTimes, event);
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
      .filter(time => time.minute() === 0);
    let offSet = 0;
    // calculate the numbers of cells to offset the hours grid
    // since we only whant display the full hours
    if (allTimes[0].minutes() !== 0) {
      offSet = 4 - (allTimes[0].minutes() / 15);
    }
    const style = { margin: `0 0 0 ${75 + (offSet * 13)}px` };
    const colTitles = hourTime.map(time => (
      <p
        key={time}
        styleName="grid-hour"
      >{time.format('h a')}</p>
    ));
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
        key={quarter.time}
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
    ));
  }

  renderGrid() {
    const { grid } = this.state;
    return (
      <div>
        {this.renderGridHours()}
        {
          grid.map((row, rowIndex) => (
            <div key={row.date} styleName="column">
              <div styleName="rowGrid">
                <div styleName="date-cell">
                  {row.date.format('Do MMM')} <br /> {row.date.format('ddd')}
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
