
import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import _ from 'lodash';
import jsonpatch from 'fast-json-patch';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';

import { listCalendars } from '../../util/calendar';
import { isCurUser } from '../../util/commonPropTypes';

const inlineStyles = {
  modal: {
    title: { backgroundColor: '#006400', color: '#ffffff', fontSize: '25px', height: '25px', paddingTop: 6 },
    content: { width: '310px', maxWidth: '310px', minWidth: '310px' },
    bodyStyle: { minHeight: '260px', paddingTop: 10 },
  },
};

class CalendarIntegrationSettings extends Component {
  @autobind
  static dialogActions(cbToggleCalSetDialog, handleSaveSetings) {
    return [
      <FlatButton label="Cancel" primary onTouchTap={cbToggleCalSetDialog} />,
      <FlatButton label="Save" primary onTouchTap={handleSaveSetings} />,
    ];
  }

  static calendarsLoad = async () => {
    try {
      const listCal = await listCalendars();
      return listCal;
    } catch (err) {
      console.error('err at CalendarsLoad', err);
      return [];
    }
  }

  static checkPrimaryCalendar = async (props, selectedCalendarList) => {
    const { curUser, cbEditCurUser } = props;
    try {
      const selectedCalendars = _.cloneDeep(curUser.GoogleSelectedCalendars) || [];
      const primaryCal = selectedCalendarList.filter(cal => cal.primary === true)[0].summary;
      const hasPrimaryCal = _.find(selectedCalendars, { calendarId: primaryCal });
      if (!hasPrimaryCal
        && curUser.enablePrimaryCalendar) {
        selectedCalendars.push({ calendarId: primaryCal });
        const nCurUser = _.cloneDeep(curUser);
        const observeCurUser = jsonpatch.observe(nCurUser);
        nCurUser.GoogleSelectedCalendars = selectedCalendars;
        nCurUser.enablePrimaryCalendar = false;
        const patchesForAdd = jsonpatch.generate(observeCurUser);
        await cbEditCurUser(patchesForAdd);
      }
      return selectedCalendars;
    } catch (err) {
      console.error('err at componentWillReceiveProps CalendarIntegrationSettings', err);
      return err;
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      openModalCalSet: false,
      googleCalendarList: [],
      selectedCalendarList: [],
    };
  }

  async componentWillMount() {
    const { openModalCalSet } = this.props;
    try {
      const googleCalendarList = await CalendarIntegrationSettings.calendarsLoad();
      const selectedCalendarList =
        await CalendarIntegrationSettings.checkPrimaryCalendar(this.props, googleCalendarList);
      this.setState({
        openModalCalSet,
        googleCalendarList,
        selectedCalendarList,
      });
    } catch (err) {
      console.error('componentWillMount CalendarIntegrtionSetings', err);
    }
  }

  async componentWillReceiveProps(nextProps) {
    const { openModalCalSet } = nextProps;
    try {
      const googleCalendarList = await CalendarIntegrationSettings.calendarsLoad();
      const selectedCalendarList =
        await CalendarIntegrationSettings.checkPrimaryCalendar(nextProps, googleCalendarList);
      this.setState({
        openModalCalSet,
        googleCalendarList,
        selectedCalendarList,
      });
    } catch (err) {
      console.error('componentWillReceiveProps CalendarIntegrtionSetings', err);
    }
  }


  @autobind
  handleDialogClose() {
    this.props.cbToggleCalSetDialog();
  }

  @autobind
  handleCellClick(rowIndex) {
    const { selectedCalendarList, googleCalendarList } = this.state;
    const nSelectedCal = _.cloneDeep(selectedCalendarList);
    const selectedCalendarItem = { calendarId: googleCalendarList[rowIndex].id };
    console.log('selectedCalendarItem', selectedCalendarItem, 'selectedCalendarList', selectedCalendarList);
    // ARRUMAR
    if (_.findIndex(selectedCalendarList, ['calendarId', selectedCalendarItem.calendarId]) === -1) {
      nSelectedCal.push(selectedCalendarItem);
    } else {
      nSelectedCal.splice(_.findIndex(selectedCalendarList, ['calendarId', selectedCalendarItem.calendarId]), 1);
    }
    this.setState({ selectedCalendarList: nSelectedCal });
  }

  @autobind
  async handleSaveSetings() {
    const { selectedCalendarList } = this.state;
    console.log('handleSaveSetings, selectedCalendarList', selectedCalendarList);
    const { curUser, cbEditCurUser, cbToggleCalSetDialog } = this.props;
    const nCurUser = _.cloneDeep(curUser);
    const observeCurUser = jsonpatch.observe(nCurUser);
    nCurUser.GoogleSelectedCalendars = [];
    const patchForDelete = jsonpatch.generate(observeCurUser);
    nCurUser.GoogleSelectedCalendars = selectedCalendarList;
    const patchesForAdd = jsonpatch.generate(observeCurUser);
    const patches =
      _.concat(patchForDelete, patchesForAdd);
    try {
      await cbEditCurUser(patches);
      cbToggleCalSetDialog();
    } catch (err) {
      console.error('handleSaveSetings CalendarIntegration', err);
    }
  }

  renderTableRows() {
    const { googleCalendarList, selectedCalendarList } = this.state;
    if (googleCalendarList.length === 0) return null;
    const rows = [];
    googleCalendarList.forEach((calendar) => {
      const calTitle = (calendar.primary) ? 'Primary' : calendar.summary;
      const hasSelectedCalendar = _.findIndex(selectedCalendarList, ['calendarId', calendar.id]) > -1;
      rows.push(
        <TableRow key={calendar.id} selected={hasSelectedCalendar}>
          <TableRowColumn>{calTitle}</TableRowColumn>
        </TableRow>,
      );
    });
    const result = (<TableBody deselectOnClickaway={false}> {rows} </TableBody>);
    return result;
  }

  renderTable() {
    const inlineStyles = { TableHeaderColumn: { fontSize: '18px' } };
    return (
      <Table fixedHeader selectable multiSelectable onCellClick={this.handleCellClick}>
        <TableHeader displaySelectAll={false} adjustForCheckbox >
          <TableRow>
            <TableHeaderColumn style={inlineStyles.TableHeaderColumn}>Calendars</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        {this.renderTableRows()}
      </Table>
    );
  }

  render() {
    const { dialogActions } = CalendarIntegrationSettings;
    return (
      <Dialog
        titleStyle={inlineStyles.modal.title}
        contentStyle={inlineStyles.modal.content}
        bodyStyle={inlineStyles.modal.bodyStyle}
        title="Wich calendars to use ? "
        modal
        open={this.props.openModalCalSet}
        actions={dialogActions(this.handleDialogClose, this.handleSaveSetings)}
        styleName="GoogleCalendarDialog"
      >
        {this.renderTable()}
      </Dialog>
    );
  }
}

CalendarIntegrationSettings.defaultProps = {
  curUser: () => { console.error('curUser prop validation not set!'); },
};

CalendarIntegrationSettings.propTypes = {
  curUser: isCurUser,
  cbToggleCalSetDialog: PropTypes.func.isRequired,
  cbEditCurUser: PropTypes.func.isRequired,
  openModalCalSet: PropTypes.bool.isRequired,
};

export default CalendarIntegrationSettings;
