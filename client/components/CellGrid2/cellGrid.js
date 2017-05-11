import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import PropTypes from 'prop-types';
import moment from 'moment';

import styles from './cell-grid.css';

class CellGrid extends Component {

  // Change the border of the cell if it's minutes = 0 or 30 to help visually
  // separate 15 minute blocks from 30 minute and 1 hour blocks.
  static formatCellBorder(time) {
    const minutes = time.format('m').toString();
    if (minutes === '0') {
      return '1px solid rgb(120, 120, 120)';
    } else if (minutes === '30') {
      return '1px solid #c3bebe';
    }
    return {};
  }

  componentWillMount() {
    const { date } = this.props;
    this.setState({ date: moment(date) });
  }

  render() {
    const { date } = this.state;
    const { participants, backgroundColors } = this.props;

    const inlineStyle = {
      borderLeft: this.constructor.formatCellBorder(date),
      backgroundColor: (participants.length > 0) ? backgroundColors[participants.length - 1] : 'transparent',
    };

    return (
      <div
        style={inlineStyle}
        styleName="cell"
        key={moment(date).toDate()}
        onMouseOver={this.props.onMouseOver}
        onMouseLeave={this.props.onMouseLeave}
      />
    );
  }
}

CellGrid.defaultProps = {
  isSelected: false,
  backgroundColors: ['transparent'],
};

CellGrid.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  participants: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.String })).isRequired,
  backgroundColors: PropTypes.arrayOf(PropTypes.string),
  onMouseOver: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired,
};

export default cssModules(CellGrid, styles);
