import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import PropTypes from 'prop-types';
import moment from 'moment';
import _ from 'lodash';

import styles from './cell-grid.css';

class CellGrid extends Component {

  static styleNameCompose(
    heightlightedUser, heatMapMode, backgroundColors, curUser, gridJump, quarter) {
    // select the class for the border base style
    let style = 'cell';
    const minutes = moment(quarter.time).minutes();
    if (gridJump) {
      style += ' cellGridJump';
    } else if (minutes === 0) {
      style += ' cellBorderHour';
    } else if (minutes === 30) {
      style += ' cellBorderHalfHour';
    }
    // if have a user to hightLight and is present at this cell
    if (heightlightedUser) {
      if (_.find(quarter.participants, heightlightedUser)) {
        style += ' cellHighlighted';
      } else {
        style += ' cellNotHeiglighted';
      }
    }
    return style;
  }

  static formatCellBackgroundColor(heatMapMode, backgroundColors, curUser, quarter) {
    if (quarter.disable) {
      return '#DADADA';
    }
    if (heatMapMode) {
      if (quarter.participants.length > 0) {
        return backgroundColors[quarter.participants.length - 1];
      }
      return 'transparent';
    }

    if (_.find(quarter.participants, curUser._id)) {
      return '#000000';
    }
    if (quarter.participants.length > 0) {
      return '#AECDE0';
    }
    return 'transparent';
  }

  constructor(props) {
    super(props);
    this.state = {
      participants: [],
      heatMapMode: false,
    };
  }

  componentWillMount() {
    const { heatMapMode, rowIndex, columnIndex, heightlightedUser, quarter } = this.props;
    this.setState({
      heatMapMode,
      rowIndex,
      columnIndex,
      heightlightedUser,
      quarter,
    });
  }

  componentWillReceiveProps(nextProps) {
    const { heatMapMode, heightlightedUser, quarter } = nextProps;
    this.setState({ heatMapMode, heightlightedUser, quarter });
  }

  render() {
    const { heatMapMode, heightlightedUser, quarter } = this.state;
    const { backgroundColors, curUser, gridJump } = this.props;
    const { formatCellBackgroundColor, styleNameCompose } = this.constructor;

    const styleNames = styleNameCompose(
      heightlightedUser, heatMapMode, backgroundColors, curUser, gridJump, quarter);

    const inlineStyle = {
      backgroundColor: formatCellBackgroundColor(
        heatMapMode, backgroundColors, curUser, quarter),
    };

    return (
      <div
        role="presentation"
        style={inlineStyle}
        styleName={styleNames}
        key={quarter.date}
        onMouseOver={this.props.onMouseOver}
        onMouseLeave={this.props.onMouseLeave}
        onMouseDown={this.props.onMouseDown}
        onMouseUp={this.props.onMouseUp}
      />
    );
  }
}

CellGrid.defaultProps = {
  backgroundColors: ['transparent'],
  rowIndex: 0,
  columnIndex: 0,
  heightlightedUser: '',
  disable: false,
};

CellGrid.propTypes = {
  heatMapMode: PropTypes.bool.isRequired,
  // date: PropTypes.instanceOf(Date).isRequired,
  // participants: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.String })).isRequired,
  backgroundColors: PropTypes.arrayOf(PropTypes.string),
  onMouseOver: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired,
  onMouseDown: PropTypes.func.isRequired,
  onMouseUp: PropTypes.func.isRequired,
  rowIndex: PropTypes.number,
  columnIndex: PropTypes.number,
  heightlightedUser: PropTypes.string,
  gridJump: PropTypes.bool.isRequired,
  // disable: PropTypes.bool,

  // Current user
  curUser: PropTypes.shape({
    _id: PropTypes.string,      // Unique user id
    name: PropTypes.string,     // User name
    avatar: PropTypes.string,   // URL to image representing user(?)
  }).isRequired,
  quarter: PropTypes.shape({
    time: PropTypes.instanceOf(Date).isRequired,
    participants: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.String })).isRequired,
    notParticipants: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.String })).isRequired,
    disable: PropTypes.bool,
  }).isRequired,
};

export default cssModules(CellGrid, styles, { allowMultiple: true });
