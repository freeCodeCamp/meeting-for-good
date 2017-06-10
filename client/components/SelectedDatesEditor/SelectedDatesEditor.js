import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import autobind from 'autobind-decorator';
import cssModules from 'react-css-modules';
import PropTypes from 'prop-types';
import DayPicker, { DateUtils } from 'react-day-picker';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import _ from 'lodash';

import styles from './selected-dates-editor.css';

const moment = extendMoment(Moment);


class SelectedDatesEditor extends Component {

  static createDatesRange(dates) {
    let datesRanges = dates.map((date) => {
      const range = moment.range(moment(date.fromDate).startOf('date'), moment(date.toDate).startOf('date'));
      return Array.from(range.by('days', { step: 1 }));
    });
    datesRanges = _.flatten(datesRanges);
    datesRanges.sort((a, b) => {
      const x = a.clone().unix();
      const y = b.clone().unix();
      return x - y;
    });
    datesRanges = datesRanges.map(date => moment(date)._d);
    return datesRanges;
  }

  constructor(props) {
    super(props);
    const { event } = props;
    this.state = {
      DialogOpen: false,
      event,
      selectedDates: [],
    };
  }

  componentWillMount() {
    const { event } = this.props;
    const { createDatesRange } = this.constructor;
    const selectedDates = createDatesRange(event.dates);
    this.setState({ selectedDates });
  }

  @autobind
  handleCloseDialog() {
    this.setState({ DialogOpen: false });
  }

  @autobind
  handleOpenDialog() {
    this.setState({ DialogOpen: true });
  }

  @autobind
  handleEditEventDates() {
    const { event } = this.props;
    console.log(event.name);
  }

  @autobind
  handleDayClick(day, { disabled }) {
    if (disabled) return;
    const selectedDates = _.cloneDeep(this.state.selectedDates);
    let index = 0;
    let dateNotFound = true;
    while (index < selectedDates.length && dateNotFound) {
      if (moment(selectedDates[index]).isSame(moment(day), 'date')) {
        selectedDates.splice(index, 1);
        dateNotFound = false;
      }
      index += 1;
    }

    if (dateNotFound) {
      selectedDates.push(day);
    }
    this.setState({ selectedDates });
  }

  render() {
    const inlineStyles = {
      modal: {
        title: {
          backgroundColor: '#006400',
          color: '#ffffff',
          fontSize: '25px',
          height: '25px',
          paddingTop: 6,
        },
        content: {
          width: '18%',
          maxWidth: '18%',
          minWidth: '270px',
        },
        bodyStyle: {
          paddingTop: 10,
        },
      },
    };

    const actions = [
      <FlatButton
        label="Cancel"
        primary
        onTouchTap={this.handleCloseDialog}
      />,
      <FlatButton
        label="yes"
        secondary
        onTouchTap={this.handleEditEventDates}
      />,
    ];
    const { DialogOpen, selectedDates } = this.state;
    return (
      <div>
        <FlatButton
          label="Edit dates"
          onTouchTap={this.handleOpenDialog}
        />
        <Dialog
          title="Event Dates Editor"
          actions={actions}
          open={DialogOpen}
          titleStyle={inlineStyles.modal.title}
          contentStyle={inlineStyles.modal.content}
          bodyStyle={inlineStyles.modal.bodyStyle}
        >
          <DayPicker
            fromMonth={selectedDates[0]}
            disabledDays={DateUtils.isPastDay}
            onDayClick={this.handleDayClick}
            classNames={styles}
            selectedDays={selectedDates}
          />
        </Dialog>
      </div>
    );
  }
}

SelectedDatesEditor.propTypes = {
  // Event containing list of event participants
  event: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    owner: PropTypes.string,
    active: PropTypes.bool,
    selectedTimeRange: PropTypes.array,
    dates: PropTypes.arrayOf(PropTypes.shape({
      fromDate: PropTypes.string,
      toDate: PropTypes.string,
      _id: PropTypes.string,
    })),
    participants: PropTypes.arrayOf(PropTypes.shape({
      userId: PropTypes.shape({
        id: PropTypes.string,
        avatar: PropTypes.string,
        name: PropTypes.string,
        emails: PropTypes.arrayOf(PropTypes.string),
      }),
      _id: PropTypes.string,
      status: PropTypes.oneOf([0, 1, 2, 3]),
      emailUpdate: PropTypes.bool,
      ownerNotified: PropTypes.bool,
      availability: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    })),
  }).isRequired,
};

export default cssModules(SelectedDatesEditor, styles);
