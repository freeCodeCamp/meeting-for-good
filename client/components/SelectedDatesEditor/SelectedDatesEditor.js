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
import { filterAvailabilitysOutsideDatesRange, createDatesRange, dateRangeReducer } from './selectedDatesEditorUtils';
import { isEvent } from '../../util/commonPropTypes';

import styles from './selected-dates-editor.css';

const moment = extendMoment(Moment);

class SelectedDatesEditor extends Component {

  constructor(props) {
    super(props);
    const { event } = props;
    this.state = {
      dialogOpen: false,
      dialogWarningOpen: false,
      dialogMinimumDateOpen: false,
      event,
      selectedDates: [],
    };
  }

  componentWillMount() {
    const { event } = this.props;
    const selectedDates = createDatesRange(event.dates);
    this.setState({ selectedDates });
  }

  componentWillReceiveProps(nextProps) {
    const { event } = nextProps;
    const selectedDates = createDatesRange(event.dates);
    this.setState({ selectedDates });
  }

  @autobind
  handleCloseDialog() {
    const { event } = this.props;
    const selectedDates = createDatesRange(event.dates);
    this.setState({ dialogOpen: false, selectedDates });
  }

  @autobind
  handleOpenDialog() {
    this.setState({ dialogOpen: true });
  }

  @autobind
  async handleEditEventDates() {
    const { event, submitDates } = this.props;
    const { selectedDates } = this.state;
    const nEvent = _.cloneDeep(event);
    const observerEvent = jsonpatch.observe(nEvent);
    nEvent.dates = [];
    const patchforDelete = jsonpatch.generate(observerEvent);
    nEvent.dates = dateRangeReducer(selectedDates, event);
    const patchesforAddDates = jsonpatch.generate(observerEvent);
    const eventAvailFilter = filterAvailabilitysOutsideDatesRange(nEvent);
    nEvent.participants.forEach((participant) => participant.availability = []);
    const patchesforDeleteAvail = jsonpatch.generate(observerEvent);
    nEvent.participants.forEach((participant, index) => {
      participant.availability = eventAvailFilter.participants[index].availability;
    });
    const patchesforAddAvail = jsonpatch.generate(observerEvent);
    const patches =
      _.concat(patchforDelete, patchesforAddDates, patchesforDeleteAvail, patchesforAddAvail);
    try {
      await submitDates(patches);
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

    if (dateNotFound) selectedDates.push(day);
    this.setState({ selectedDates });
  }

  @autobind
  handleSaveDates() {
    const { selectedDates } = this.state;
    if (selectedDates.length > 0) {
      this.setState({ dialogOpen: false, dialogWarningOpen: true });
    } else {
      this.setState({ dialogMinimumDateOpen: true });
    }
  }

  renderDialogWarning() {
    const { dialogWarningOpen } = this.state;
    const actions = [
      <FlatButton label="Cancel" primary onTouchTap={() => this.setState({ dialogWarningOpen: false })} />,
      <FlatButton label="save" secondary onTouchTap={this.handleEditEventDates} />,
    ];
    return (
      <Dialog
        title="Warning"
        open={dialogWarningOpen}
        actions={actions}
        styleName="DialogWarningDate"
      >
        <p> {'Perhaps you are deleting some existing availabilities.'} </p>
        <p> {'Are you sure you want to edit this/these dates? '}</p>
      </Dialog>
    );
  }

  renderDialogMinimumDate() {
    const { dialogMinimumDateOpen } = this.state;
    const actions = [<FlatButton label="Cancel" primary onTouchTap={() => this.setState({ dialogMinimumDateOpen: false })} />];
    return (
      <Dialog title="Warning" styleName="DialogWarningMin" open={dialogMinimumDateOpen} actions={actions} >
        <p> {'You need at least one date.'} </p>
      </Dialog>
    );
  }

  render() {
    const inlineStyles = {
      title: { backgroundColor: '#006400', color: '#ffffff', fontSize: '25px', height: '25px', paddingTop: 6 },
      content: { width: '290px', maxWidth: '290px', minWidth: '290px' },
      bodyStyle: { minHeight: '260px', paddingTop: 10 },
    };

    const actions = [
      <FlatButton label="Cancel" primary onTouchTap={this.handleCloseDialog} />,
      <FlatButton label="save" secondary onTouchTap={this.handleSaveDates} />,
    ];
    const { dialogOpen, selectedDates } = this.state;
    return (
      <div>
        <FlatButton label="Edit dates" onTouchTap={this.handleOpenDialog} />
        <Dialog
          title="Event Dates Editor"
          actions={actions}
          open={dialogOpen}
          titleStyle={inlineStyles.title}
          contentStyle={inlineStyles.content}
          bodyStyle={inlineStyles.bodyStyle}
        >
          <DayPicker
            fromMonth={selectedDates[0]}
            onDayClick={this.handleDayClick}
            classNames={styles}
            selectedDays={selectedDates}
          />
        </Dialog>
        {this.renderDialogWarning()}
        {this.renderDialogMinimumDate()}
      </div>
    );
  }
}

SelectedDatesEditor.defaultProps = {
  submitDates: () => { console.log('submitDates func not passed in!'); },
  event: () => { console.log('event prop validation not set!'); },
};

SelectedDatesEditor.propTypes = {
  submitDates: PropTypes.func,
  // Event containing list of event participants
  event: isEvent,
};

export default cssModules(SelectedDatesEditor, styles);
