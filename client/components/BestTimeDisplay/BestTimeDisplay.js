import React, { Component } from 'react';
import { ListItem } from 'material-ui/List';
import _ from 'lodash';
import DateRangeIcon from 'material-ui/svg-icons/action/date-range';
import DayPicker, { DateUtils } from 'react-day-picker';
import cssModules from 'react-css-modules';
import PropTypes from 'prop-types';
import KeyBoardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import KeyBoardArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up';
import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton';

import styles from './best-times-display.css';
import { renderTzInfo, renderRows, buildBestTimes } from './besttimesDisplayUtils';
import { isEvent } from '../../util/commonPropTypes';

class BestTimeDisplay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      event: this.props.event,
      disablePicker: false,
      containerHeight: 190,
      showAllDates: false,
    };
  }

  componentWillMount() {
    const { event, disablePicker } = this.props;
    const displayTimes = buildBestTimes(event);
    this.setState({
      event, displayTimes, disablePicker,
    });
  }

  componentWillReceiveProps(nextProps) {
    const { event, disablePicker } = nextProps;
    const displayTimes = buildBestTimes(event);
    this.setState({
      event, displayTimes, disablePicker,
    });
  }

  isBestTime() {
    const { displayTimes } = this.state;
    const bestTimes = displayTimes;
    let isBestTime;
    if (bestTimes !== undefined) {
      if (Object.keys(bestTimes).length > 0) {
        isBestTime = true;
      } else {
        isBestTime = false;
      }
    } else {
      isBestTime = false;
    }

    return isBestTime;
  }

  renderBestTime() {
    const { displayTimes, showAllDates } = this.state;
    let index = 0;
    const quantToShow = (showAllDates) ? Object.keys(displayTimes).length : 3;
    const rows = [];
    while (index < quantToShow && index < Object.keys(displayTimes).length) {
      const date = Object.keys(displayTimes)[index];
      rows.push(<ListItem
        key={date}
        style={{ height: '20px', fontSize: '18px' }}
        primaryTogglesNestedList
        leftIcon={<DateRangeIcon style={{ paddingBottom: '0px', marginBottom: '0x' }} />}
        initiallyOpen
        disabled
        primaryText={date}
        autoGenerateNestedIndicator={false}
        nestedListStyle={{ padding: '0px' }}
        innerDivStyle={{ padding: '16px 0px 0px 50px' }}
        nestedItems={renderRows(displayTimes[date].hours)}
      />);
      if (index !== Object.keys(displayTimes).length - 1 && index !== quantToShow - 1) {
        rows.push(<Divider key={`Divider ${date}`} styleName="Divider" />);
      }
      index += 1;
    }
    return rows;
  }

  renderDayPicker() {
    const { event } = this.state;
    let maxDate;
    let minDate;
    const ranges = event.dates.map(({ fromDate, toDate }) => ({
      from: new Date(fromDate),
      to: new Date(toDate),
    }));

    const dates = event.dates.map(({ fromDate, toDate }) => ({
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
    }));

    let selectedDays;
    if (ranges) {
      selectedDays = day =>
        DateUtils.isDayInRange(day, dates) ||
        ranges.some(v => DateUtils.isDayInRange(day, v));
      const dateInRanges = _.flatten(ranges.map(range => [range.from, range.to]));
      maxDate = new Date(Math.max.apply(null, dateInRanges));
      minDate = new Date(Math.min.apply(null, dateInRanges));
    }
    return (
      <DayPicker
        classNames={styles}
        initialMonth={minDate}
        fromMonth={minDate}
        toMonth={maxDate}
        selectedDays={selectedDays}
        onClick={() => {}}
      />
    );
  }

  renderArrowMsg() {
    const { showAllDates, displayTimes } = this.state;
    return (showAllDates) ?
      (<em> click to hide</em>)
      :
      (<em>
        This event has {Object.keys(displayTimes).length - 3} more possible dates. <br />
        Click to expand then all.
      </em>);
  }

  renderArrow() {
    const { showAllDates } = this.state;
    const inlineStyle = { arrow: { fontSize: '18px', transform: 'scale(18, 2)' } };
    return (!showAllDates) ?
      (<KeyBoardArrowDown style={inlineStyle.arrow} color="#f2f2f2" />) :
      (<KeyBoardArrowUp style={inlineStyle.arrow} color="#f2f2f2" />);
  }

  render() {
    const { displayTimes, disablePicker, showAllDates } = this.state;
    // Only show timezone information when we're at the dashboard.
    return (
      <div styleName="bestTimeDisplay">
        {this.isBestTime(displayTimes) ?
          <div>
            {renderTzInfo()}
            <h6 styleName="bestTimeTitle"> The following times work for everyone: </h6>
            {this.renderBestTime()}
            {
              (Object.keys(displayTimes).length > 3) ?
                <div styleName="QuantMoreWrapper">
                  <FlatButton
                    fullWidth
                    onClick={() => this.setState({ showAllDates: !showAllDates })}
                    icon={this.renderArrow()}
                  />
                  {this.renderArrowMsg()}
                </div> : null
            }
          </div>
          : (disablePicker === false) ? this.renderDayPicker() : null
        }
      </div>
    );
  }
}

BestTimeDisplay.defaultProps = {
  disablePicker: false,
  event: () => { console.log('event prop validation not set!'); },
};

BestTimeDisplay.propTypes = {
  disablePicker: PropTypes.bool,

  // Event containing list of event participants
  event: isEvent,
};

export default cssModules(BestTimeDisplay, styles);
