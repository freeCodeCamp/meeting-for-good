import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import PropTypes from 'prop-types';

import { styleNameCompose, formatCellBackgroundColor } from './cellGridUtils';
import styles from './cell-grid.css';

class CellGrid extends Component {

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
    const { quarter } = this.props;
    const styleNames = styleNameCompose(this.state, this.props);
    const inlineStyle = {
      backgroundColor: formatCellBackgroundColor(this.state, this.props),
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
  onMouseOver: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired,
  onMouseDown: PropTypes.func.isRequired,
  onMouseUp: PropTypes.func.isRequired,
  rowIndex: PropTypes.number,
  columnIndex: PropTypes.number,
  heightlightedUser: PropTypes.string,

  // Current user
  quarter: PropTypes.shape({
    time: PropTypes.instanceOf(Date).isRequired,
    participants: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.String })).isRequired,
    notParticipants: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.String })).isRequired,
    disable: PropTypes.bool,
  }).isRequired,
};

export default cssModules(CellGrid, styles, { allowMultiple: true });
