import moment from 'moment';
import _ from 'lodash';

export const styleNameCompose = (
  heightlightedUser, heatMapMode, backgroundColors, curUser, gridJump, quarter) => {
  // select the class for the border base style
  let style = 'cell';
  const minutes = moment(quarter.time).minutes();
  if (gridJump) {
    style += ' cellGridJump';
  } else if (minutes === 0) {
    style += ' cellBorderHour';
  } else if (minutes === 30) {
    style += ' cellBorderHalfHour';
  }
  // if have a user to hightLight and is present at this cell
  if (heightlightedUser) {
    if (_.find(quarter.participants, heightlightedUser)) {
      style += ' cellHighlighted';
    } else {
      style += ' cellNotHeiglighted';
    }
  }
  return style;
};

export const formatCellBackgroundColor = (heatMapMode, backgroundColors, curUser, quarter) => {
  // background for disabled cells
  if (quarter.disable) {
    return '#DADADA';
  }

  if (heatMapMode) {
    if (quarter.participants.length > 0) {
      return backgroundColors[quarter.participants.length - 1];
    }
    return 'transparent';
  }

  if (_.find(quarter.participants, curUser._id)) {
    return '#000000';
  }
  if (quarter.participants.length > 0) {
    return '#AECDE0';
  }
  return 'transparent';
};
