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

const cell = time => (
  <p key={time} styleName="grid-hour" >
    {time.format('h a')}
  </p>
);

const cellForOffsetAfterjump = (jumpIndexAllTimes, allTimes) => {
  const nextfullHour = moment(allTimes[jumpIndexAllTimes]).startOf('hour').add(1, 'h');
  console.log(nextfullHour._d);
  const numCells = nextfullHour.diff(moment(allTimes[jumpIndexAllTimes]), 'minutes') / 15;
  const cell = <div style={{ minWidth: `${numCells * 13}px` }} />;
  return cell;
};

const JumpCell = (time, jumpIndexAllTimes, allTimes) => (
  <div styleName="jumperCellWrapper" key={`jumper ${time}`}>
    <SettingsEthernet styleName="jumperIcon" />
    {cellForOffsetAfterjump(jumpIndexAllTimes, allTimes)}
    {cell(time)}
  </div>);

const sizeLastCellBeforeJump = (allTimes, jumpIndexAllTimes) => `${((((60 - allTimes[jumpIndexAllTimes].minute()) / 15) + 1) * 12.5)}px`;

const colTitlesAjust = (jumpCellIndex, colTitles, props) => {
  const { allTimes, jumpIndexAllTimes } = props;
  const size = sizeLastCellBeforeJump(allTimes, jumpIndexAllTimes);
  console.log(size, allTimes[jumpIndexAllTimes]._d);
  const style = { width: size, minWidth: size };
  const colTit = _.cloneDeep(colTitles);
  colTit[jumpCellIndex - 1] = (
    <div
      key={colTit[jumpCellIndex - 1].key}
      styleName="lastCellAfterJumpHour"
      style={style}
    />
  );
  return colTit;
};

const calcHourTime = (allTimes) => {
  const hourTime = [];
  allTimes.forEach((time, index) => {
    if (time.minute() === 0) hourTime.push({ time, index });
  });
  return hourTime;
};

// calculate the numbers of cells to offset the hours grid
// since we only want display the full hours
const inicialOffSet = (allTimes) => {
  if (allTimes[0].minutes() !== 0) {
    return 4 - (allTimes[0].minutes() / 15);
  }
  return 0;
};

const GridHours = (props) => {
  const { allTimes, jumpIndexAllTimes } = props;

  // array only with full hours thats will be used to display at grid
  const hourTime = calcHourTime(allTimes);
  const style = { margin: `0 0 0 ${75 + (inicialOffSet(allTimes) * 13)}px` };
  let gridJump = false;
  let jumpCellIndex = null;
  let colTitles = hourTime.map((hour, index) => {
    if (index !== 0) gridJump = (moment(hour.time).subtract(1, 'hour').isSame(hourTime[index - 1].time)) === false;
    if (gridJump) {
      jumpCellIndex = index;
      return JumpCell(hour.time, jumpIndexAllTimes, allTimes);
    }
    return cell(hour.time);
  });
  if (jumpCellIndex) {
    colTitles = colTitlesAjust(jumpCellIndex, colTitles, props);
  }
  return (<div id="timesTitle" styleName="timesTitle" style={style}> {colTitles} </div>);
};

GridHours.propTypes = {
  jumpIndexAllTimes: PropTypes.number.isRequired,
  allTimes: PropTypes.arrayOf(momentPropTypes.momentObj).isRequired,
};


export default cssModules(GridHours, styles);
