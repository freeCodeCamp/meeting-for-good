import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import colorsys from 'colorsys';

import styles from './heat-map.css';

class HeatMap extends Component {
  static generateHeatMapBackgroundColors(quantOfParticipants) {
    const saturationDivisions = 100 / quantOfParticipants;
    const saturations = [];
    for (let i = 0; i <= 100; i += saturationDivisions) {
      saturations.push(i);
    }
    return saturations.map(saturation => colorsys.hsvToHex({
      h: 271,
      s: saturation,
      v: 100,
    }));
  }

  constructor(props) {
    super(props);

    this.state = {
      curUser: {},
    };
  }

  componentWillMount() {

  }

  render() {
    return (
      <div>
        heat map
      </div>
    );
  }

}


export default cssModules(HeatMap, styles);

HeatMap.propTypes = {
  dates: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  curUser: React.PropTypes.shape({
    _id: React.PropTypes.string,
    name: React.PropTypes.string,
    avatar: React.PropTypes.string,
  }).isRequired,
  event: React.PropTypes.shape({
    participants: React.PropTypes.array,
  }).isRequired,
};
