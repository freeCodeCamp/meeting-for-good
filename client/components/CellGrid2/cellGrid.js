import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import PropTypes from 'prop-types';
import moment from 'moment';
import _ from 'lodash';

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

  static formatCellBackgroundColor(heatMapMode, participants, backgroundColors, curUser) {
    if (heatMapMode) {
      if (participants.length > 0) {
        return backgroundColors[participants.length - 1];
      }
      return 'transparent';
    }

    // console.log(curUser._id, _.find(participants, curUser._id));
    if (_.find(participants, curUser._id)) {
      return '#000000';
    }
    if (participants.length > 0) {
      return '#DADADA';
    }
    return 'transparent';
  }

  componentWillMount() {
    const { date, participants } = this.props;
    this.setState({ date: moment(date) });
    console.log(JSON.stringify(participants));
  }

  render() {
    const { date } = this.state;
    const { heatMapMode, participants, backgroundColors, curUser } = this.props;
    const { formatCellBackgroundColor, formatCellBorder } = this.constructor;

    const inlineStyle = {
      borderLeft: formatCellBorder(date),
      backgroundColor: formatCellBackgroundColor(
        heatMapMode, participants, backgroundColors, curUser),
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
  heatMapMode: PropTypes.bool.isRequired,
  date: PropTypes.instanceOf(Date).isRequired,
  participants: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.String })).isRequired,
  backgroundColors: PropTypes.arrayOf(PropTypes.string),
  onMouseOver: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired,
  // Current user
  curUser: PropTypes.shape({
    _id: PropTypes.string,      // Unique user id
    name: PropTypes.string,     // User name
    avatar: PropTypes.string,   // URL to image representing user(?)
  }).isRequired,
};

export default cssModules(CellGrid, styles);
