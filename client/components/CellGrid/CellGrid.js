import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import PropTypes from 'prop-types';
import moment from 'moment';
import _ from 'lodash';

import styles from './cell-grid.css';

class CellGrid extends Component {

  static styleNameCompose(
    heightlightedUser, heatMapMode, participants, backgroundColors, curUser, time) {
    // select the class for the border base style
    let style = 'cell';
    const minutes = time.minutes();
    if (minutes === 0) {
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
      return '#DADADA';
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
      date, participants, heatMapMode, rowIndex, columnIndex, heightlightedUser } = this.props;
    this.setState({
      date: moment(date), participants, heatMapMode, rowIndex, columnIndex, heightlightedUser,
    });
  }

  componentWillReceiveProps(nextProps) {
    const { date, participants, heatMapMode, heightlightedUser } = nextProps;
    this.setState({ date: moment(date), participants, heatMapMode, heightlightedUser });
  }

  render() {
    const { date, participants, heatMapMode, heightlightedUser } = this.state;
    const { backgroundColors, curUser } = this.props;
    const { formatCellBackgroundColor, styleNameCompose } = this.constructor;

    const styleNames = styleNameCompose(
      heightlightedUser, heatMapMode, participants, backgroundColors, curUser, date);

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

  // Current user
  curUser: PropTypes.shape({
    _id: PropTypes.string,      // Unique user id
    name: PropTypes.string,     // User name
    avatar: PropTypes.string,   // URL to image representing user(?)
  }).isRequired,
};

export default cssModules(CellGrid, styles, { allowMultiple: true });
