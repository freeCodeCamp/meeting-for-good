import Moment from 'moment';
import { extendMoment } from 'moment-range';
import cssModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import momentPropTypes from 'react-moment-proptypes';
import SettingsEthernet from 'material-ui/svg-icons/action/settings-ethernet';
import _ from 'lodash';
import styles from './availability-grid.css';

const moment = extendMoment(Moment);

// calculate the numbers of cells to offset the hours grid
// since we only want display the full hours
const inicialOffSet = (allTimes) => {
  if (allTimes[0].minutes() !== 0) {
    return 4 - (allTimes[0].minutes() / 15);
  }
  return 0;
};

// depois
const cellForOffsetAfterjump = (jumpIndexAllTimes, allTimes) => {
  const nextfullHour = moment(allTimes[jumpIndexAllTimes]).startOf('hour').add(1, 'h');
  const numCells = nextfullHour.diff(moment(allTimes[jumpIndexAllTimes]), 'minutes') / 15;
  const cell = <div style={{ minWidth: `${numCells * 13}px` }} />;
  // console.log(moment(allTimes[jumpIndexAllTimes])._d,
  // nextfullHour._d, nextfullHour.diff(moment(allTimes[jumpIndexAllTimes]), 'minutes'), numCells);
  return cell;
};

// antes
const sizeLastCellBeforeJump = (allTimes, jumpIndexAllTimes) => `${((((allTimes[jumpIndexAllTimes - 1].minute()) / 15) + 1) * 12.5)}px`;
  // console.log('sizeLastCellBeforeJump', allTimes.length, jumpIndexAllTimes);
  // console.log('sizeLastCellBeforeJump', allTimes[jumpIndexAllTimes - 1]._d);
  // return `${((((allTimes[jumpIndexAllTimes - 1].minute()) / 15) + 1) * 12.5)}px`;

const cell = hour => (
  <p key={hour._d} styleName="grid-hour" >
    {hour.format('h a')}
  </p>
);

const JumpCell = (time, jumpIndexAllTimes, allTimes) => (
  <div styleName="jumperCellWrapper" key={`jumper ${time}`}>
    <SettingsEthernet styleName="jumperIcon" />
    {cellForOffsetAfterjump(jumpIndexAllTimes, allTimes)}
    {cell(time)}
  </div>
);

const colTitlesAjust = (jumpCellHourIndex, colTitles, props) => {
  const { allTimes, jumpIndexAllTimes } = props;
  const sizeLastCellBefore = sizeLastCellBeforeJump(allTimes, jumpIndexAllTimes);
  // console.log('sizeLastCellBefore', sizeLastCellBefore);
  const style = { width: sizeLastCellBefore, minWidth: sizeLastCellBefore };
  const colTit = _.cloneDeep(colTitles);
  // console.log('colTitlesAjust colTit', colTit, jumpCellHourIndex);
  colTit[jumpCellHourIndex - 1] = (
    <div
      key={`${colTit[jumpCellHourIndex - 1].key} jumped`}
      styleName="lastCellAfterJumpHour"
      style={style}
    />
  );
  return colTit;
};

const calcHourTime = (allTimes) => {
  const hourTime = [];
  allTimes.forEach((time) => {
    if (time.minute() === 0) hourTime.push(time);
  });
  // console.log('hourTime', hourTime.forEach(time => console.log(time._d)));
  return hourTime;
};

const GridHours = (props) => {
  const { allTimes, jumpIndexAllTimes } = props;
  const style = { margin: `0 0 0 ${75 + (inicialOffSet(allTimes) * 13)}px` };
  // array only with full hours thats will be used to display at grid
  const hourTime = calcHourTime(allTimes);
  let gridJump = false;
  let jumpCellHourIndex = null;
  let colTitles = hourTime.map((hour, index) => {
    // dont do at the begining and at end
    if (index !== 0 && index !== hourTime.length - 1) {
      gridJump = (moment(hour).subtract(1, 'hour').isSame(hourTime[index - 1])) === false;
    }
    if (gridJump) {
      jumpCellHourIndex = index;
      // console.log(gridJump, hour._d);
      return JumpCell(hour, jumpIndexAllTimes, allTimes);
    }
    // console.log(gridJump, hour._d);
    return cell(hour);
  });
  if (jumpCellHourIndex) {
    colTitles = colTitlesAjust(jumpCellHourIndex, colTitles, props);
  }
  return (<div key={'GridHours'} id="timesTitle" styleName="timesTitle" style={style}> {colTitles} </div>);
};

GridHours.propTypes = {
  jumpIndexAllTimes: PropTypes.number.isRequired,
  allTimes: PropTypes.arrayOf(momentPropTypes.momentObj).isRequired,
};


export default cssModules(GridHours, styles);
