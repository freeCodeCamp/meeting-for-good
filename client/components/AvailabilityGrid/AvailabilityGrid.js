import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import _ from 'lodash';
import moment from 'moment';
import autobind from 'autobind-decorator';
import colorsys from 'colorsys';
import jsonpatch from 'fast-json-patch';
import jz from 'jstimezonedetect';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import PropTypes from 'prop-types';

import styles from './availability-grid.css';
import { getHours, getMinutes, removeZero } from '../../util/time-format';
import { getDaysBetween } from '../../util/dates.utils';
import { getTimesBetween } from '../../util/times.utils';
import enteravail from '../../assets/enteravail.gif';
import { loadEventFull } from '../../util/events';
import CellGrid from '../CellGrid/cellGrid';

class AvailabilityGrid extends Component {
  // Given two numbers num1 and num2, generates an array of all the numbers
  // between the two. num1 doesn't necessarily have to be smaller than num2.
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

  static generateHeatMapBackgroundColors(quantOfParticipants) {
    const saturationDivisions = 100 / quantOfParticipants;
    const saturations = [];
    for (let i = 0; i <= 100; i += saturationDivisions) {
      saturations.push(i);
    }
    return saturations.map(saturation => colorsys.hsvToHex({
      h: 271,
      s: saturation,
      v: 100,
    }));
  }

  static updateAvailabilityForRange(rowRange, colRange, updateAvail) {
    rowRange.forEach((i) => {
      colRange.forEach((j) => {
        const query = `div[data-row="${i}"][data-col="${j}"]`;
        const el = document.querySelector(query);
        updateAvail(el);
      });
    });
  }

  @autobind
  static addCellToAvailability(t) {
    t.style.background = 'purple';
  }

  @autobind
  static removeCellFromAvailability(t) {
    t.style.background = 'transparent';
  }

  constructor(props) {
    super(props);

    this.state = {
      allTimes: [],
      allTimesRender: [],
      allDates: [],
      allDatesRender: [],
      dateFormatStr: 'Do MMM ddd',
      availableOnDate: [],
      notAvailableOnDate: [],
      hourTime: [],
      openModal: false,
      rangeSelected: false,
      startSelection: false,
      mouseDownRow: null,
      mouseDownCol: null,
      oldRowRange: null,
      oldColRange: null,
    };
  }

  componentWillMount() {
    const { event, curUser, dates } = this.props;
    const { dateFormatStr } = this.state;
    // construct all dates range to load at the grid
    const allDates = _.flatten(dates.map(({ fromDate, toDate }) =>
      getDaysBetween(fromDate, toDate),
    ));

    // construct all times range to load a the grid
    const allTimes = _.flatten(
      [this.props.dates[0]].map(({ fromDate, toDate }) =>
        getTimesBetween(fromDate, toDate),
      ),
    );

    // format all dates to be displayed  'Do MMM ddd'
    const allDatesRender = allDates
      .map(date => moment(date).format(dateFormatStr));

     // format all times to be displayed 'hh:mm a'
    const allTimesRender = allTimes
      .map(time => moment(time).format('hh:mm a'));

    // we dont whant to show the last time at title for
    // layout reasons
    allTimesRender.pop();

    // array only with full hours thats will be used to display at grid
    const hourTime = allTimesRender
      .filter(time => String(time).split(':')[1].split(' ')[0] === '00');

    const lastHourTimeEl = hourTime.slice(-1)[0];
    const lastAllTimesRenderEl = allTimesRender.slice(-1)[0];

    if (getHours(lastHourTimeEl) !== getHours(lastAllTimesRenderEl) || getMinutes(lastAllTimesRenderEl) === 45) {
      hourTime.push(
        moment(new Date())
        .set('h', getHours(lastHourTimeEl))
        .set('m', getMinutes(lastHourTimeEl))
        .add(1, 'h')
        .format('hh:mm a'),
      );
    }

    // set current user availability
    let myAvailability = {};
    const isParticipant  = event.participants.filter((participant) => {
      return participant.userId._id === curUser._id;
    });
    // its alredy a participant?
    // if is not is accepting a invite so myAvailability = {}
    if (isParticipant.length > 0) {
      myAvailability = isParticipant[0].availability;
    }
    this.setState({
      myAvailability,
      event,
      curUser,
      allDates,
      allTimes,
      allDatesRender,
      allTimesRender,
      hourTime,
    });
  }

  componentDidMount() {
    const { myAvailability } = this.state;
    const { heatmap } = this.props;
    if (heatmap) {
      this.renderHeatmap();
    }
    // only render the availability if curUser has availability set
    if (myAvailability && myAvailability.length > 0 && heatmap === false) {
      this.renderAvail();
    }

    // Check if two adjacent grid hours labels are consecutive or not. If not,
    // then split the grid at this point.
    const hourTime = this.state.hourTime.slice(0);

    for (let i = 0; i < hourTime.length; i += 1) {
      if (hourTime[i + 1]) {
        const date = moment(new Date());
        const nextDate = moment(new Date());

        date.set('h', getHours(hourTime[i]));
        date.set('m', getMinutes(hourTime[i]));

        nextDate.set('h', getHours(hourTime[i + 1]));
        nextDate.set('m', getMinutes(hourTime[i + 1]));

        // date.add (unfortunately) mutates the original moment object. Hence we
        // don't add an hour to the object again when it's inserted into
        // this.state.hourTime.
        if (date.add(1, 'h').format('hh:mm') !== nextDate.format('hh:mm')) {
          const query = `.cell[data-time='${nextDate.format('hh:mm a')}']`;
          const cells = Array.from(document.querySelectorAll(query));
          cells.forEach((cell) => { cell.style.marginLeft = '50px'; });

          // 'hack' (the modifyHourTime function) to use setState in
          // componentDidMount and bypass eslint. Using setState in
          // componentDidMount couldn't be avoided in this case.
          this.modifyHourTime(hourTime, date, i);
        }
      }
    }
  }

  @autobind
  getFromToForEl(el) {
    const {
      allTimesRender,
      allDatesRender,
      allDates,
      allTimes,
    } = this.state;

    const timeIndex = allTimesRender.indexOf(el.getAttribute('data-time'));
    const dateIndex = allDatesRender.indexOf(el.getAttribute('data-date'));

    const date = moment(allDates[dateIndex]).get('date');

    const from = moment(allTimes[timeIndex]).set('date', date)._d;
    const to = moment(allTimes[timeIndex + 1]).set('date', date)._d;

    return [from.toISOString(), to.toISOString()];
  }

  modifyHourTime(hourTime, date, i) {
    // inserts the formatted date object at the 'i+1'th index in
    // this.state.hourTime.
    this.setState({
      hourTime: [
        ...hourTime.slice(0, i + 1),
        date.format('hh:mm a'),
        ...hourTime.slice(i + 1),
      ],
    });
  }

  @autobind
  handleCancelBtnClick() {
    this.props.closeGrid();
  }

  @autobind
  handleCellMouseDown(ev) {
    // is at showing heatMap then ignore click
    if (this.props.heatmap) {
      return;
    }

    const {
        generateRange,
        updateAvailabilityForRange,
    } = this.constructor;

    const thisRow = Number(ev.target.getAttribute('data-row'));
    const thisCol = Number(ev.target.getAttribute('data-col'));

    const cellBackgroundColor = getComputedStyle(ev.target)['background-color'];
    const cellIsSelected = (cellBackgroundColor === 'rgb(128, 0, 128)');

    let updateAvail;
    if (cellIsSelected) {
      updateAvail = this.constructor.removeCellFromAvailability;
    } else {
      updateAvail = this.constructor.addCellToAvailability;
    }
    const rowRange = generateRange(thisRow, thisRow);
    const colRange = generateRange(thisCol, thisCol);
    updateAvailabilityForRange(rowRange, colRange, updateAvail);

    this.setState({
      mouseDownRow: thisRow,
      mouseDownCol: thisCol,
    });
  }

  @autobind
  handleCellMouseUp() {
    if (this.props.heatmap) {
      return;
    }

    this.setState({
      mouseDownRow: null,
      mouseDownCol: null,
      oldRowRange: null,
      oldColRange: null,
    });
  }

  @autobind
  handleCellMouseOver(ev) {
    const { generateRange,
      updateAvailabilityForRange,
      addCellToAvailability,
      removeCellFromAvailability,
     } = this.constructor;
    const { mouseDownRow, mouseDownCol, oldRowRange, oldColRange } = this.state;
    const { heatmap } = this.props;

    if (!heatmap) {
      const thisRow = Number(ev.target.getAttribute('data-row'));
      const thisCol = Number(ev.target.getAttribute('data-col'));

      if (mouseDownRow !== null && mouseDownCol !== null) {
        if (oldRowRange != null && oldColRange != null) {
          const updateAvail = removeCellFromAvailability;
          updateAvailabilityForRange(oldRowRange, oldColRange, updateAvail);
        }

        const updateAvail = addCellToAvailability;
        const rowRange = generateRange(mouseDownRow, thisRow);
        const colRange = generateRange(mouseDownCol, thisCol);
        updateAvailabilityForRange(rowRange, colRange, updateAvail);

        this.setState({
          oldRowRange: rowRange,
          oldColRange: colRange,
        });
      }
      return;
    }

    const { allTimesRender, allDatesRender, allDates, allTimes } = this.state;
    const { event } = this.props;
    const formatStr = 'Do MMMM YYYY hh:mm a';
    const availableOnDate = [];
    const notAvailableOnDate = [];

    const participants = JSON.parse(JSON.stringify(event.participants))
      .filter(participant => participant.availability)
      .map((participant) => {
        participant.availability = participant.availability
          .map(avail => new Date(avail[0]))
          .map(avail => moment(avail).format(formatStr));
        return participant;
      });

    const timeIndex = allTimesRender.indexOf(
      ev.target.getAttribute('data-time'),
    );

    const dateIndex = allDatesRender.indexOf(
      ev.target.getAttribute('data-date'),
    );

    const date = moment(allDates[dateIndex]).get('date');
    const cellFormatted = moment(allTimes[timeIndex])
      .set('date', date)
      .format(formatStr);

    participants.forEach((participant) => {
      if (participant.availability.indexOf(cellFormatted) > -1) {
        availableOnDate.push({
          name: participant.userId.name,
          _id: participant.userId._id,
        });
      } else {
        notAvailableOnDate.push({
          name: participant.userId.name,
          _id: participant.userId._id,
        });
      }
    });

    this.setState({ availableOnDate, notAvailableOnDate });
  }

  @autobind
  handleCellMouseLeave() {
    this.setState({ availableOnDate: [], notAvailableOnDate: [] });
  }

  @autobind
  updateCellAvailability(e) {
    const cellBackgroundColor = getComputedStyle(e.target)['background-color'];
    const cellIsSelected = cellBackgroundColor !== 'rgb(128, 0, 128)';

    if (cellIsSelected) {
      this.constructor.addCellToAvailability(e.target);
    } else {
      this.constructor.removeCellFromAvailability(e.target);
    }
  }

  @autobind
  async submitAvailability() {
    const { allDates, allTimes, allDatesRender, allTimesRender } = this.state;
    const { curUser } = this.props;
    const availability = [];
    const cells = document.querySelectorAll('.cell');
    // construct the availability to be submited
    cells.forEach((cell) => {
      const cellBackgroundColor = getComputedStyle(cell)['background-color'];
      if (cellBackgroundColor === 'rgb(128, 0, 128)') {
        const timeIndex = allTimesRender.indexOf(cell.getAttribute('data-time'));
        const dateIndex = allDatesRender.indexOf(cell.getAttribute('data-date'));

        const date = moment(allDates[dateIndex]).get('date');

        const from = moment(allTimes[timeIndex]).set('date', date)._d;
        const to = moment(allTimes[timeIndex + 1]).set('date', date)._d;

        availability.push([from, to]);
      }
    });

    // again i need to call the full event to edit... since he dont the
    // info that maybe have a guest "deleted"
    const eventToEdit = await loadEventFull(this.props.event._id);
    const event = JSON.parse(JSON.stringify(eventToEdit));
    const observerEvent = jsonpatch.observe(event);
     // first check if cur exists as a participant
     // if is not add the curUser as participant
    const isParticipant = event.participants.filter(participant => participant.userId._id === curUser._id);
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
  editAvailability() {
    this.props.editAvail();
  }

  renderHeatmap(shadedForBackground = false) {
    const { generateHeatMapBackgroundColors } = this.constructor;
    const { allTimesRender, allDatesRender, allDates, allTimes } = this.state;
    const { event } = this.props;
    const availability = event.participants.map(participant => participant.availability);
    // load the backgraund colors array
    const backgroundColors = generateHeatMapBackgroundColors(event.participants.length);

    const formatStr = 'Do MMMM YYYY hh:mm a';
    const availabilityNum = {};
    const cells = document.querySelectorAll('.cell');

    let flattenedAvailability = _.flatten(availability);

    flattenedAvailability = flattenedAvailability
      .filter(avail => avail)
      .map(avail => new Date(avail[0]))
      .map(avail => moment(avail).format(formatStr));

    flattenedAvailability.forEach((avail) => {
      if (availabilityNum[avail]) {
        availabilityNum[avail] += 1;
      } else {
        availabilityNum[avail] = 1;
      }
    });
    cells.forEach((cell) => {
      const timeIndex = allTimesRender.indexOf(cell.getAttribute('data-time'));
      const dateIndex = allDatesRender.indexOf(cell.getAttribute('data-date'));

      const date = moment(allDates[dateIndex]).get('date');
      const cellFormatted = moment(allTimes[timeIndex])
        .set('date', date)
        .format(formatStr);
      if (shadedForBackground) {
        if (availabilityNum[cellFormatted] > 0) {
          cell.style.background = '#E0E0E0';
        }
      } else {
        cell.style.background = backgroundColors[availabilityNum[cellFormatted]];
      }
    });
  }

  renderAvail() {
    this.renderHeatmap(true);
    const { allTimesRender, allDatesRender, allDates, allTimes, myAvailability } = this.state;
    const { addCellToAvailability } = this.constructor;
    const cells = document.querySelectorAll('.cell');
    const formatStr = 'Do MMMM YYYY hh:mm a';
    const myAvailabilityFrom = myAvailability
      .map(avail => new Date(avail[0]))
      .map(avail => moment(avail).format(formatStr));

    cells.forEach((cell) => {
      const timeIndex = allTimesRender.indexOf(cell.getAttribute('data-time'));
      const dateIndex = allDatesRender.indexOf(cell.getAttribute('data-date'));

      const date = moment(allDates[dateIndex]).get('date');
      const cellFormatted = moment(allTimes[timeIndex])
        .set('date', date)
        .format(formatStr);

      if (myAvailabilityFrom.indexOf(cellFormatted) > -1) {
        addCellToAvailability(cell);
      }
    });
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
        <img src={enteravail} alt="entering availablity gif" />
      </Dialog>
    );
  }

  renderGridHours() {
    const { hourTime, allTimes } = this.state;
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
      >{`${removeZero(time.split(':')[0])} ${time.split(' ')[1]}`}</p>
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

  render() {
    const { allDatesRender, allTimesRender } = this.state;
    return (
      <div styleName="Column">
        <div styleName="row">
          <FlatButton
            primary
            onClick={() => this.setState({ openModal: true })}
          >
            How do I use the grid?
          </FlatButton>
        </div>
        {this.renderGridHours()}
        {allDatesRender.map((date, i) => (
          <div key={date} className="grid-row" styleName="row">
            <div styleName="cell-aside">
              {date}
            </div>
            {allTimesRender.map((time, j) => {
              return (
                <CellGrid
                  key={`${date} ${time}`}
                  time={time}
                  date={date}
                  row={i}
                  col={j}
                  onMouseDown={this.handleCellMouseDown}
                  onMouseUp={this.handleCellMouseUp}
                  onMouseOver={this.handleCellMouseOver}
                  onMouseLeave={this.handleCellMouseLeave}
                />
              );
            })}
          </div>
        ))}
        <p styleName="info">
          <em>Each time slot represents 15 minutes.</em>
        </p>
        <p styleName="info">
          <em>
            Displaying all times in your local timezone: {jz.determine().name()}
          </em>
        </p>
        <br />
        <div className="center">
          {this.props.heatmap ?
            <RaisedButton
              primary
              label="Edit Availability"
              onClick={this.editAvailability}
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
        <div styleName="hover-container">
          {this.state.availableOnDate.length > 0 ?
            <div styleName="hover-available">
              <h5>Available</h5>
              {this.state.availableOnDate.map(participant =>
                <h6 key={participant._id}>{participant.name}</h6>,
              )}
            </div> :
            null
          }
          {this.state.notAvailableOnDate.length > 0 ?
            <div styleName="hover-available">
              <h5>Unavailable</h5>
              {this.state.notAvailableOnDate.map(participant =>
                <h6 key={participant._id}>{participant.name}</h6>,
              )}
            </div> :
            null
          }
        </div>
        {this.renderDialog()}
      </div>
    );
  }
}

AvailabilityGrid.defaultProps = {
  heatmap: false,
  myAvailability: [],
  participants: [],
  submitAvail: () => { console.log('submitAvail func not passed in!'); },
  closeGrid: () => { console.log('closeGrid func not passed in!'); },
  editAvail: () => { console.log('ediAvail func not passed in!'); },
};

AvailabilityGrid.propTypes = {
  // List of dates ranges for event
  dates: PropTypes.arrayOf(PropTypes.shape({
    fromDate: PropTypes.instanceOf(Date),
    toDate: PropTypes.instanceOf(Date),
  })).isRequired,

  // True if grid is showing heat map
  heatmap: PropTypes.bool,

  // Current user
  curUser: PropTypes.shape({
    _id: PropTypes.string,      // Unique user id
    name: PropTypes.string,     // User name
    avatar: PropTypes.string,   // URL to image representing user(?)
  }).isRequired,

  // Function to run when availability for current user is ready to be updated
  submitAvail: PropTypes.func,

  // Function to run when user wishes to cancel availability editing
  closeGrid: PropTypes.func,

  // Function to run to switch from heat map to availability editing
  editAvail: PropTypes.func,

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
};

export default cssModules(AvailabilityGrid, styles);

