import React from 'react';
import cssModules from 'react-css-modules';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';

import { styleNameCompose, formatCellBackgroundColor } from './cellGridUtils';
import styles from './cell-grid.css';

const toolTipRows = (eventsCalendar) => {
  const rows = [];
  eventsCalendar.forEach((event) => {
    rows.push(
      <div>
        <p> {(event.name) ? event.name : 'No Name'} </p>
        <p> organized by : {event.organizer} </p>
      </div>,
    );
  });
  return rows;
};

const ToolTip = (quarter) => {
  if (quarter.eventCalendar.length > 0) {
    return (<ReactTooltip
      id={quarter.time.toString()}
      place="top"
      effect="float"
    >
      <p> You have a schedule conflicted with: </p>
      {toolTipRows(quarter.eventCalendar)}
    </ReactTooltip>);
  }
  return null;
};

const CellGrid = (props) => {
  const { quarter, onMouseOver, onMouseLeave, onMouseDown, onMouseUp } = props;
  const styleNames = styleNameCompose(props);
  const inlineStyle = {
    backgroundColor: formatCellBackgroundColor(props),
    cursor: (quarter.disable) ? 'not-allowed' : 'pointer',
  };

  return (
    <div
      role="presentation"
      style={inlineStyle}
      styleName={styleNames}
      key={quarter.date}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      data-tip
      data-for={quarter.time.toString()}
    >
      {ToolTip(quarter)}
    </div>
  );
};

CellGrid.defaultProps = {
  backgroundColors: ['transparent'],
  rowIndex: 0,
  columnIndex: 0,
  heightlightedUser: '',
  disable: false,
};

CellGrid.propTypes = {
  onMouseOver: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired,
  onMouseDown: PropTypes.func.isRequired,
  onMouseUp: PropTypes.func.isRequired,

  quarter: PropTypes.shape({
    time: PropTypes.instanceOf(Date).isRequired,
    participants: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.String })).isRequired,
    notParticipants: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.String })).isRequired,
    disable: PropTypes.bool,
  }).isRequired,
};

export default cssModules(CellGrid, styles, { allowMultiple: true });
