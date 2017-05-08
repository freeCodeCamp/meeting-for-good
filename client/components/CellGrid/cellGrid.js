import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import PropTypes from 'prop-types';
import { getMinutes } from '../../util/time-format';

import styles from './cell-grid.css';

class CellGrid extends Component {

  // Change the border of the cell if it's minutes = 0 or 30 to help visually
  // separate 15 minute blocks from 30 minute and 1 hour blocks.
  static formatCellBorder(time) {
    const minutes = getMinutes(time);
    if (minutes === 0) {
      return { borderLeft: '1px solid rgb(120, 120, 120)' };
    } else if (minutes === 30) {
      return { borderLeft: '1px solid #c3bebe' };
    }
    return {};
  }

  render() {
    const {
      time, date, row, col,
      onMouseDown,
      onMouseUp,
      onMouseOver,
      onMouseLeave,
    } = this.props;
    const inlineStyle = this.constructor.formatCellBorder(time);
    return (
      <div
        style={inlineStyle}
        data-time={time}
        data-date={date}
        data-col={col}
        data-row={row}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseOver={onMouseOver}
        onMouseLeave={onMouseLeave}
        className="cell"
        styleName="cell"
      />
    );
  }
}

CellGrid.defaultProps = {
  isSelected: false,
  styleName: 'cell',
};

CellGrid.propTypes = {
  time: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  row: PropTypes.number.isRequired,
  col: PropTypes.number.isRequired,
  onMouseDown: PropTypes.func.isRequired,
  onMouseUp: PropTypes.func.isRequired,
  onMouseOver: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired,
};

export default cssModules(CellGrid, styles);
