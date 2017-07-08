import React from 'react';
import cssModules from 'react-css-modules';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';

import { styleNameCompose, formatCellBackgroundColor } from './cellGridUtils';
import styles from './cell-grid.css';

const toolTipRows = (quarter) => {
  const eventsCalendar = quarter.eventCalendar;
  console.log(quarter);
  const rows = [];
  eventsCalendar.forEach((event) => {
    rows.push(
      <div key={`toolTipRow ${quarter.time.toString()} ${event.id}`} styleName="toolTipHeaderWrapper">
        <p> {(event.name) ? event.name : 'No Name'} </p>
        <p styleName="toolTipSubHeader"> organized by : <strong>{event.organizer} </strong></p>
      </div>,
    );
  });
  return rows;
};

const ToolTip = (quarter, heatMapMode) => {
  if (quarter.eventCalendar.length > 0 && heatMapMode) {
    return (
      <ReactTooltip key={`toolTip ${quarter.time.toString()}`} id={quarter.time.toString()} place="top" effect="float">
        <h4 styleName="toolTipHeader"> You have conflicts <br /> with your Google Calendar: </h4>
        {toolTipRows(quarter)}
      </ReactTooltip>);
  }
  return null;
};

const CellGrid = (props) => {
  const { quarter, onMouseOver, onMouseLeave, onMouseDown, onMouseUp, heatMapMode } = props;
  const styleNames = styleNameCompose(props);
  const inlineStyle = {
    background: formatCellBackgroundColor(props),
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
      {ToolTip(quarter, heatMapMode)}
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
  heatMapMode: PropTypes.bool.isRequired,
  quarter: PropTypes.shape({
    time: PropTypes.instanceOf(Date).isRequired,
    participants: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string })).isRequired,
    notParticipants: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string })).isRequired,
    disable: PropTypes.bool,
  }).isRequired,
};

export default cssModules(CellGrid, styles, { allowMultiple: true });
