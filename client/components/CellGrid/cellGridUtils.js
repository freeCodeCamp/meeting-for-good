import moment from 'moment';
import _ from 'lodash';

export const styleNameCompose = (state, props) => {
  // select the class for the border base style
  const { heightlightedUser, gridJump } = state;
  const { quarter } = props;
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

export const formatCellBackgroundColor = (state, props) => {
  const { heatMapMode } = state;
  const { backgroundColors, curUser, quarter } = props;
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
