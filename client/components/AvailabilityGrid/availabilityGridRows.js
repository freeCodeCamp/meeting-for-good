import Moment from 'moment';
import { extendMoment } from 'moment-range';
import React from 'react';
import PropTypes from 'prop-types';
import cssModules from 'react-css-modules';
import styles from './availability-grid.css';

import CellGrid from '../CellGrid/CellGrid';

const moment = extendMoment(Moment);

const Cell = (quarter, columnIndex, props) => {
  const { backgroundColors, showHeatmap, curUser, quarters, rowIndex,
    handleCellMouseOver, handleCellMouseLeave, handleCellMouseDown,
    handleCellMouseUp, heightlightedUser } = props;
  const gridJump = (columnIndex > 0) ? (!moment(quarter.time).subtract(15, 'minute').isSame(moment(quarters[columnIndex - 1].time))) : false;
  return (
    <CellGrid
      quarter={quarter}
      heatMapMode={showHeatmap}
      key={quarter.time}
      gridJump={gridJump}
      backgroundColors={backgroundColors}
      onMouseOver={ev => handleCellMouseOver(ev, quarter, rowIndex, columnIndex)}
      onMouseLeave={ev => handleCellMouseLeave(ev)}
      onMouseDown={ev => handleCellMouseDown(ev, quarter, rowIndex, columnIndex)}
      onMouseUp={ev => handleCellMouseUp(ev)}
      curUser={curUser}
      rowIndex={rowIndex}
      columnIndex={columnIndex}
      heightlightedUser={heightlightedUser}
    />
  );
};

const JumpCell = (quarter, columnIndex, props) => (
  <div styleName="jumperCellWrapper" key={`jumper ${quarter.time}`}>
    JJJ
    {Cell(quarter, columnIndex, props)}
  </div>
);

const GridRow = (props) => {
  const { quarters } = props;
  const row = quarters.map((quarter, columnIndex) => {
    const gridJump = (columnIndex > 0) ? (!moment(quarter.time).subtract(15, 'minute').isSame(moment(quarters[columnIndex - 1].time))) : false;
    return (gridJump) ? JumpCell(quarter, columnIndex, props) : Cell(quarter, columnIndex, props);
  });
  return <div styleName="rowWrapper"> {row} </div>;
};

Cell.defaultProps = {
  heightlightedUser: null,
  handleCellMouseOver: () => { console.log('ediAvail func not passed in!'); },
  handleCellMouseLeave: () => { console.log('ediAvail func not passed in!'); },
  handleCellMouseDown: () => { console.log('ediAvail func not passed in!'); },
  handleCellMouseUp: () => { console.log('ediAvail func not passed in!'); },
};

GridRow.propTypes = {
  quarters: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Cell.propTypes = {
  backgroundColors: PropTypes.arrayOf(PropTypes.string).isRequired,
  showHeatmap: PropTypes.bool.isRequired,
  quarters: PropTypes.arrayOf(PropTypes.object).isRequired,
  rowIndex: PropTypes.number.isRequired,
  curUser: PropTypes.shape({
    _id: PropTypes.string,      // Unique user id
    name: PropTypes.string,     // User name
    avatar: PropTypes.string,   // URL to image representing user(?)
  }).isRequired,
  heightlightedUser: PropTypes.string,
  handleCellMouseOver: PropTypes.func,
  handleCellMouseLeave: PropTypes.func,
  handleCellMouseDown: PropTypes.func,
  handleCellMouseUp: PropTypes.func,
};
export default cssModules(GridRow, styles);
