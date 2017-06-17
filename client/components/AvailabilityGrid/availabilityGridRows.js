import React from 'react';
import PropTypes from 'prop-types';
import cssModules from 'react-css-modules';
import styles from './availability-grid.css';

import CellGrid from '../CellGrid/CellGrid';

const Cell = (quarter, columnIndex, props) => {
  const { backgroundColors, showHeatmap, curUser, rowIndex,
    handleCellMouseOver, handleCellMouseLeave, handleCellMouseDown,
    handleCellMouseUp, heightlightedUser } = props;
  return (
    <CellGrid
      quarter={quarter}
      heatMapMode={showHeatmap}
      key={quarter.time}
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

const JumpCell = quarter => (<div styleName="jumperCellGrid" key={`jumperDiv ${quarter.time}`} />);

const GridRow = (props) => {
  const { quarters, jumpTimeIdx } = props;
  const row = [];
  quarters.forEach((quarter, columnIndex) => {
    if (jumpTimeIdx === columnIndex) {
      row.push(JumpCell(quarter, columnIndex, props));
    }
    row.push(Cell(quarter, columnIndex, props));
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
  jumpTimeIdx: PropTypes.number.isRequired,
};

Cell.propTypes = {
  backgroundColors: PropTypes.arrayOf(PropTypes.string).isRequired,
  showHeatmap: PropTypes.bool.isRequired,
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
