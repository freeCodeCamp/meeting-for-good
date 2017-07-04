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
      <div key={event.id} styleName="toolTipHeaderWrapper">
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
      <ReactTooltip id={quarter.time.toString()} place="top" effect="float">
        <h4 styleName="toolTipHeader"> You have a schedule conflicted with: </h4>
        {toolTipRows(quarter.eventCalendar)}
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
    participants: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.String })).isRequired,
    notParticipants: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.String })).isRequired,
    disable: PropTypes.bool,
  }).isRequired,
};

export default cssModules(CellGrid, styles, { allowMultiple: true });
