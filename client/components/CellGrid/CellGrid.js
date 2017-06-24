import React from 'react';
import cssModules from 'react-css-modules';
import PropTypes from 'prop-types';

import { styleNameCompose, formatCellBackgroundColor } from './cellGridUtils';
import styles from './cell-grid.css';

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
    />
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
  // heatMapMode: PropTypes.bool.isRequired,
  onMouseOver: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired,
  onMouseDown: PropTypes.func.isRequired,
  onMouseUp: PropTypes.func.isRequired,
  // rowIndex: PropTypes.number,
  // columnIndex: PropTypes.number,
  // heightlightedUser: PropTypes.string,
  quarter: PropTypes.shape({
    time: PropTypes.instanceOf(Date).isRequired,
    participants: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.String })).isRequired,
    notParticipants: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.String })).isRequired,
    disable: PropTypes.bool,
  }).isRequired,
};

export default cssModules(CellGrid, styles, { allowMultiple: true });
