import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import PropTypes from 'prop-types';

import styles from './cell-grid.css';

class CellGrid extends Component {

  render() {
    const {
      time, date, row, col,
      onMouseDown,
      onMouseUp,
      onMouseOver,
      onMouseLeave,
      styleName,
    } = this.props;
    const style = (styleName) ? styleName : 'cell';
    return (
      <div
        data-time={time}
        data-date={date}
        data-col={col}
        data-row={row}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseOver={onMouseOver}
        onMouseLeave={onMouseLeave}
        className={'cell'}
        styleName={style}
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
  isSelected: PropTypes.bool,
  onMouseDown: PropTypes.func.isRequired,
  onMouseUp: PropTypes.func.isRequired,
  onMouseOver: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired,
  styleName: PropTypes.string,
};

export default cssModules(CellGrid, styles);
