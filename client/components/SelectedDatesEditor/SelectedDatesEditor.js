import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import autobind from 'autobind-decorator';
import cssModules from 'react-css-modules';
import PropTypes from 'prop-types';
import DayPicker from 'react-day-picker';
import Moment from 'moment';
import jsonpatch from 'fast-json-patch';
import { extendMoment } from 'moment-range';
import _ from 'lodash';

import styles from './selected-dates-editor.css';

const moment = extendMoment(Moment);


class SelectedDatesEditor extends Component {

  static filterAvailabilitysOutsideDatesRange(event) {
    const nEvent = _.cloneDeep(event);
    // clear all availiability of each participant at nEvent
    // so i can push only the valid ones
    nEvent.participants.forEach((participant) => {
      if (participant.availability.length > 0) {
        participant.availability = [];
      }
    },
    );
    event.dates.forEach((date) => {
      const rangeDates = moment.range(moment(date.fromDate), moment(date.toDate));
      event.participants.forEach((participant, index) => {
        participant.availability.forEach((avail) => {
          const rangeAvail = moment.range(moment(avail[0]), moment(avail[1]));
          if (rangeAvail.overlaps(rangeDates, { adjacent: false })) {
            nEvent.participants[index].availability.push(avail);
          }
        });
      });
    });
    return nEvent;
  }

  static createDatesRange(dates) {
    let datesRanges = dates.map((date) => {
      const range = moment.range(moment(date.fromDate).startOf('date'), moment(date.toDate).startOf('date'));
      return Array.from(range.by('days'));
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

  static dateRangeReducer(selectedDates, event) {
    // first save the inicial and  final original times
    const initialHour = moment(event.dates[0].fromDate).hour();
    const initialMinutes = moment(event.dates[0].fromDate).minutes();
    const finalHour = moment(event.dates[0].toDate).hour();
    const finalMinutes = moment(event.dates[0].toDate).minutes();
    const nSelectedDates = _.cloneDeep(selectedDates);
    nSelectedDates.sort((a, b) => {
      const x = moment(a).unix();
      const y = moment(b).unix();
      return x - y;
    });
    // create the first range with the fist select date
    let initialDate = moment(nSelectedDates[0]).startOf('date').hour(initialHour).minutes(initialMinutes);
    let finalDate = moment(nSelectedDates[0]).startOf('date').hour(finalHour).minutes(finalMinutes);
    let rangeToCompare = moment.range(initialDate, finalDate);
    const allRanges = [];
    if (selectedDates.length > 1) {
      nSelectedDates.shift();
      nSelectedDates.forEach((date) => {
        finalDate = moment(date).startOf('date').hour(finalHour).minutes(finalMinutes);
        // if is adjacent expand the range
        const dateToCompare = moment(rangeToCompare.end).startOf('date').add(1, 'day');
        if (dateToCompare.isSame(moment(date).startOf('date'))) {
          rangeToCompare = moment.range(rangeToCompare.start, finalDate);
        } else {
          // its a new range
          allRanges.push(rangeToCompare);
          initialDate = moment(date).startOf('date').hour(initialHour).minutes(initialMinutes);
          rangeToCompare = moment.range(initialDate, finalDate);
        }
      });
      allRanges.push(rangeToCompare);
    }
    return allRanges.map(range => ({ fromDate: range.start._d, toDate: range.end._d }));
  }

  constructor(props) {
    super(props);
    const { event } = props;
    this.state = {
      dialogOpen: false,
      dialogWarningOpen: false,
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

  componentWillReceiveProps(nextProps) {
    const { event } = nextProps;
    const { createDatesRange } = this.constructor;
    const selectedDates = createDatesRange(event.dates);
    this.setState({ selectedDates });
  }

  @autobind
  handleCloseDialog() {
    const { event } = this.props;
    const { createDatesRange } = this.constructor;
    const selectedDates = createDatesRange(event.dates);
    this.setState({ dialogOpen: false, selectedDates });
  }

  @autobind
  handleOpenDialog() {
    this.setState({ dialogOpen: true });
  }

  @autobind
  async handleEditEventDates() {
    const { event } = this.props;
    const { selectedDates } = this.state;
    const { dateRangeReducer, filterAvailabilitysOutsideDatesRange } = this.constructor;
    const nEvent = _.cloneDeep(event);
    const observerEvent = jsonpatch.observe(nEvent);
    nEvent.dates = [];
    const patchforDelete = jsonpatch.generate(observerEvent);
    nEvent.dates = dateRangeReducer(selectedDates, event);
    const patchesforAddDates = jsonpatch.generate(observerEvent);
    const eventAvailFilter = filterAvailabilitysOutsideDatesRange(nEvent);
    nEvent.participants.forEach((participant) => {
      participant.availability = [];
    });
    const patchesforDeleteAvail = jsonpatch.generate(observerEvent);
    nEvent.participants.forEach((participant, index) => {
      participant.availability = eventAvailFilter.participants[index].availability;
    });
    const patchesforAddAvail = jsonpatch.generate(observerEvent);
    const patches = _.concat(patchforDelete,
      patchesforAddDates,
      patchesforDeleteAvail,
      patchesforAddAvail);
    try {
      await this.props.submitDates(patches);
    } catch (err) {
      console.log('err at submit avail', err);
    } finally {
      this.setState({ dialogWarningOpen: false });
    }
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


  renderDialogWarning() {
    const { dialogWarningOpen } = this.state;
    const inlineStyles = {
      modal: {
        title: {
          backgroundColor: 'red',
          color: '#ffffff',
          fontSize: '25px',
          height: '25px',
          paddingTop: 6,
        },
        content: {
          width: '22%',
          maxWidth: '22%',
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
        onTouchTap={() => this.setState({ dialogWarningOpen: false })}
      />,
      <FlatButton
        label="save"
        secondary
        onTouchTap={this.handleEditEventDates}
      />,
    ];
    return (
      <Dialog
        title="Warning"
        open={dialogWarningOpen}
        actions={actions}
        titleStyle={inlineStyles.modal.title}
        contentStyle={inlineStyles.modal.content}
        bodyStyle={inlineStyles.modal.bodyStyle}
      >
        <p>
          {'Maybe you delete some existing availabilitys.'}
        </p>
        <p>
          {'Are you sure you want edit this dates ?'}
        </p>
      </Dialog>
    );
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
          width: '17%',
          maxWidth: '17%',
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
        label="save"
        secondary
        onTouchTap={() => this.setState({ dialogOpen: false, dialogWarningOpen: true })}
      />,
    ];
    const { dialogOpen, selectedDates } = this.state;
    return (
      <div>
        <FlatButton
          label="Edit dates"
          onTouchTap={this.handleOpenDialog}
        />
        <Dialog
          title="Event Dates Editor"
          actions={actions}
          open={dialogOpen}
          titleStyle={inlineStyles.modal.title}
          contentStyle={inlineStyles.modal.content}
          bodyStyle={inlineStyles.modal.bodyStyle}
        >
          <DayPicker
            fromMonth={selectedDates[0]}
            onDayClick={this.handleDayClick}
            classNames={styles}
            selectedDays={selectedDates}
          />
        </Dialog>
        {this.renderDialogWarning()}
      </div>
    );
  }
}

SelectedDatesEditor.defaultProps = {
  submitDates: () => { console.log('submitDates func not passed in!'); },
};

SelectedDatesEditor.propTypes = {
  submitDates: PropTypes.func,
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
