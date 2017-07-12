import moment from 'moment';
import _ from 'lodash';

const styleNameCompose = (props) => {
  // select the class for the border base style
  const { quarter, heightlightedUser } = props;
  let style = 'cell';
  const minutes = moment(quarter.time).minutes();
  if (minutes === 0) {
    style += ' cellBorderHour';
  } else if (minutes === 30) {
    style += ' cellBorderHalfHour';
  }
  // if have a user to hightLight and is present at this cell
  if (heightlightedUser) style += (_.find(quarter.participants, heightlightedUser)) ? ' cellHighlighted' : ' cellNotHeiglighted';
  return style;
};

const backgroundColorForHeatMap = (props) => {
  const { backgroundColors, quarter } = props;
  if (quarter.participants.length === 0) {
    if (quarter.eventCalendar.length > 0) {
      return 'repeating-linear-gradient(45deg, transparent, #DADADA, transparent 5px, transparent 5px)';
    }
    return 'transparent';
  }
  const bkgColor = backgroundColors[quarter.participants.length - 1];
  if (quarter.eventCalendar.length > 0) {
    return `repeating-linear-gradient(45deg, ${bkgColor}, #DADADA, ${bkgColor} 5px, ${bkgColor} 5px)`;
  }
  return bkgColor;
};

const backgroundColorForEdit = (props) => {
  const { curUser, quarter } = props;
  if (_.find(quarter.participants, curUser._id)) {
    if (quarter.eventCalendar.length > 0) {
      return 'repeating-linear-gradient(45deg, #000000, #DADADA, #000000 5px, #000000 5px)';
    }
    return '#000000';
  }
  if (quarter.participants.length > 0) {
    if (quarter.eventCalendar.length > 0) {
      return 'repeating-linear-gradient(45deg, #AECDE0, #DADADA, #AECDE0 5px, #AECDE0 5px)';
    }
    return '#AECDE0';
  }
  if (quarter.eventCalendar.length > 0) {
    return 'repeating-linear-gradient(45deg, transparent, #DADADA, transparent 5px, transparent 5px)';
  }
  return 'transparent';
};

const formatCellBackgroundColor = (props) => {
  const { quarter, heatMapMode } = props;
  // background for disabled cells
  if (quarter.disable) return '#DADADA';
  if (heatMapMode) return backgroundColorForHeatMap(props);
  return backgroundColorForEdit(props);
};

export { styleNameCompose, formatCellBackgroundColor };
