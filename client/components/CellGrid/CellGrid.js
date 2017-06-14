import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import PropTypes from 'prop-types';
import moment from 'moment';
import _ from 'lodash';

import styles from './cell-grid.css';

class CellGrid extends Component {

  static styleNameCompose(
    heightlightedUser, heatMapMode, participants, backgroundColors, curUser, time, gridJump) {
    // select the class for the border base style
    let style = 'cell';
    const minutes = time.minutes();
    if (gridJump) {
      style += ' cellGridJump';
    } else if (minutes === 0) {
      style += ' cellBorderHour';
    } else if (minutes === 30) {
      style += ' cellBorderHalfHour';
    }
    // if have a user to hightLight and is present at this cell
    if (heightlightedUser) {
      if (_.find(participants, heightlightedUser)) {
        style += ' cellHighlighted';
      } else {
        style += ' cellNotHeiglighted';
      }
    }
    return style;
  }

  static formatCellBackgroundColor(heatMapMode, participants, backgroundColors, curUser) {
    if (heatMapMode) {
      if (participants.length > 0) {
        return backgroundColors[participants.length - 1];
      }
      return 'transparent';
    }

    if (_.find(participants, curUser._id)) {
      return '#000000';
    }
    if (participants.length > 0) {
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
    const {
      date, participants, heatMapMode, rowIndex, columnIndex, heightlightedUser, disable,
    } = this.props;
    this.setState({
      date: moment(date),
      participants,
      heatMapMode,
      rowIndex,
      columnIndex,
      heightlightedUser,
      disable,
    });
  }

  componentWillReceiveProps(nextProps) {
    const { date, participants, heatMapMode, heightlightedUser, disable } = nextProps;
    this.setState({ date: moment(date), participants, heatMapMode, heightlightedUser, disable });
  }

  render() {
    const { date, participants, heatMapMode, heightlightedUser } = this.state;
    const { backgroundColors, curUser, gridJump } = this.props;
    const { formatCellBackgroundColor, styleNameCompose } = this.constructor;

    const styleNames = styleNameCompose(
      heightlightedUser, heatMapMode, participants, backgroundColors, curUser, date, gridJump);

    const inlineStyle = {
      backgroundColor: formatCellBackgroundColor(
        heatMapMode, participants, backgroundColors, curUser),
    };

    return (
      <div
        role="presentation"
        style={inlineStyle}
        styleName={styleNames}
        key={date}
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
  date: PropTypes.instanceOf(Date).isRequired,
  participants: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.String })).isRequired,
  backgroundColors: PropTypes.arrayOf(PropTypes.string),
  onMouseOver: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired,
  onMouseDown: PropTypes.func.isRequired,
  onMouseUp: PropTypes.func.isRequired,
  rowIndex: PropTypes.number,
  columnIndex: PropTypes.number,
  heightlightedUser: PropTypes.string,
  gridJump: PropTypes.bool.isRequired,
  disable: PropTypes.bool,

  // Current user
  curUser: PropTypes.shape({
    _id: PropTypes.string,      // Unique user id
    name: PropTypes.string,     // User name
    avatar: PropTypes.string,   // URL to image representing user(?)
  }).isRequired,
};

export default cssModules(CellGrid, styles, { allowMultiple: true });
