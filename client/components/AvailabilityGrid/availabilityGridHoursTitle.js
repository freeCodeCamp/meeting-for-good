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
const JumpCell = time => (
  <div styleName="jumperCellWrapper" key={`jumper ${time}`}>
    <SettingsEthernet styleName="jumperIcon" />
    {cell(time)}
  </div>);

const sizeLastCell = (allTimes, jumpIndexAllTimes) => `${(allTimes[jumpIndexAllTimes].minute() / 15) * 12}px`;

const colTitlesAjust = (jumpCellIndex, colTitles, props) => {
  const { allTimes, jumpIndexAllTimes } = props;
  const size = sizeLastCell(allTimes, jumpIndexAllTimes);
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
  const { allTimes } = props;

  // array only with full hours thats will be used to display at grid
  const hourTime = calcHourTime(allTimes);
  const style = { margin: `0 0 0 ${75 + (inicialOffSet(allTimes) * 13)}px` };
  let gridJump = false;
  let jumpCellIndex = null;
  let colTitles = hourTime.map((hour, index) => {
    if (index !== 0) gridJump = (moment(hour.time).subtract(1, 'hour').isSame(hourTime[index - 1].time)) === false;
    if (gridJump) {
      jumpCellIndex = index;
      return JumpCell(hour.time);
    }
    return cell(hour.time);
  });
  if (jumpCellIndex) {
    colTitles = colTitlesAjust(jumpCellIndex, colTitles, props);
  }
  return (<div id="timesTitle" styleName="timesTitle" style={style}> {colTitles} </div>);
};

GridHours.propTypes = {
  allTimes: PropTypes.arrayOf(momentPropTypes.momentObj).isRequired,
};


export default cssModules(GridHours, styles);
