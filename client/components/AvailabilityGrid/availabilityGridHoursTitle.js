import Moment from 'moment';
import { extendMoment } from 'moment-range';
import cssModules from 'react-css-modules';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import momentPropTypes from 'react-moment-proptypes';


import styles from './availability-grid.css';

const moment = extendMoment(Moment);

class GridHours extends Component {

  render() {
    const { allTimes } = this.props;
    // array only with full hours thats will be used to display at grid
    const hourTime = [];
    allTimes.forEach((time, index) => {
      if (time.minute() === 0) {
        hourTime.push({ time, index });
      }
    });
    let offSet = 0;
    // calculate the numbers of cells to offset the hours grid
    // since we only want display the full hours
    //
    if (allTimes[0].minutes() !== 0) offSet = 4 - (allTimes[0].minutes() / 15);
    const style = { margin: `0 0 0 ${75 + (offSet * 13)}px` };
    let gridNotJump = true;
    const colTitles = hourTime.map((hour, index) => {
      if (index !== 0) gridNotJump = (moment(hour.time).subtract(1, 'hour').isSame(hourTime[index - 1].time)) === true;
      return (
        <p
          key={hour.time}
          styleName={gridNotJump ? 'grid-hour' : 'grid-hourJump'}
          style={!gridNotJump ? { paddingLeft: `${((13 * (hour.index % 4)) + 3)}px` } : null}
        >
          {hour.time.format('h a')}
        </p>
      );
    });
    const timesTitle = (<div id="timesTitle" styleName="timesTitle" style={style}> {colTitles} </div>);
    return timesTitle;
  }
}

GridHours.propTypes = {
  allTimes: PropTypes.arrayOf(momentPropTypes.momentObj
    .withPredicate(momentObject => momentObject.isUTC()).isRequired).isRequired,
};

export default cssModules(GridHours, styles);
