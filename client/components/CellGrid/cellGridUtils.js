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
  if (heightlightedUser) {
    if (_.find(quarter.participants, heightlightedUser)) {
      style += ' cellHighlighted';
    } else {
      style += ' cellNotHeiglighted';
    }
  }
  if (quarter.eventCalendar.length > 0) {
    style += ' CellHasCalendarEvent';
  }
  return style;
};

const formatCellBackgroundColor = (props) => {
  const { backgroundColors, curUser, quarter, heatMapMode } = props;
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

export { styleNameCompose, formatCellBackgroundColor };
