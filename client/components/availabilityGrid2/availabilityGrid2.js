import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import _ from 'lodash';
import moment from 'moment';
// import autobind from 'autobind-decorator';
// import jsonpatch from 'fast-json-patch';
// import jz from 'jstimezonedetect';
import FlatButton from 'material-ui/FlatButton';
// import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import PropTypes from 'prop-types';
import chroma from 'chroma-js';

import { getDaysBetween } from '../../util/dates.utils';
import getTimesBetween from '../../util/times.utils';
import enteravailGif from '../../assets/enteravail.gif';
import CellGrid from '../CellGrid2/cellGrid';
import SnackBarGrid from '../SnackBarGrid/snackBarGrid';
import styles from './availability-grid2.css';


class AvailabilityGrid2 extends Component {

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
    const flattenedAvailability = AvailabilityGrid2.flattenedAvailability(event);
    allDates.forEach((date) => {
      const dateMoment = moment(date);
      grid.push({
        date: dateMoment,
        quarters: allTimes.map((quarter) => {
          // construct the time / date value for each cell
          const dateHourForCell = moment()
            .year(dateMoment.year())
            .month(dateMoment.month())
            .date(dateMoment.date())
            .hour(moment(quarter).hour())
            .minute(moment(quarter).minute())
            .second(0)
            .millisecond(0);
          const guests = [];
          const notGuests = [];
          event.participants.forEach((participant) => {
            const availForThatParticipant = flattenedAvailability[participant.userId._id];
            if (availForThatParticipant.indexOf(dateHourForCell.toJSON()) > -1) {
              const guest = {};
              guest[participant.userId._id] = participant.userId.name;
              guests.push(guest);
            } else {
              const guest = {};
              guest[participant.userId._id] = participant.userId.name;
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
    console.log(grid);
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
    };
  }

  componentWillMount() {
    const { event, dates } = this.props;
    const { createGridComplete, generateHeatMapBackgroundColors } = this.constructor;

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
    const grid = createGridComplete(allDates, allTimes, event);
    const backgroundColors = generateHeatMapBackgroundColors(event.participants.length);
    this.setState({ grid, backgroundColors, allTimes });
  }

  handleCellMouseOver(ev, quarter) {
    ev.preventDefault();
    const snackBarGuests = quarter.participants.map(participant => Object.values(participant));
    const snackBarNoGuests = quarter.notParticipants.map(participant => Object.values(participant));
    this.setState({ openSnackBar: true, snackBarGuests, snackBarNoGuests });
  }

  handleCellMouseLeave(ev) {
    ev.preventDefault();
    //this.setState({ openSnackBar: false });
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
    if (moment(allTimes).minutes() !== 0) {
      offSet = 4 - (moment(allTimes).minutes() / 15);
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

  renderGridRow(quarters) {
    const { backgroundColors } = this.state;
    return quarters.map(quarter => (
      <CellGrid
        key={moment(quarter.time).toDate()}
        date={quarter.time}
        backgroundColors={backgroundColors}
        participants={quarter.participants}
        onMouseOver={ev => this.handleCellMouseOver(ev, quarter)}
        onMouseLeave={ev => this.handleCellMouseLeave(ev)}
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
          grid.map(row => (
            <div key={moment(row.date).format('Do MMM ddd')} styleName="column">
              <div styleName="row">
                <div styleName="date-cell">
                  {moment(row.date).format('Do MMM ddd')}
                </div>
                {this.renderGridRow(row.quarters)}
              </div>
            </div>
          ))
        }
      </div>
    );
  }
  render() {
    const { snackBarGuests, snackBarNoGuests, openSnackBar } = this.state;
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
        <SnackBarGrid
          guests={snackBarGuests}
          noGuests={snackBarNoGuests}
          openSnackBar={openSnackBar}
        />
      </div>
    );
  }
}

AvailabilityGrid2.propTypes = {
  // List of dates ranges for event
  dates: PropTypes.arrayOf(PropTypes.shape({
    fromDate: PropTypes.instanceOf(Date),
    toDate: PropTypes.instanceOf(Date),
  })).isRequired,

  // True if grid is showing heat map
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

export default cssModules(AvailabilityGrid2, styles);
