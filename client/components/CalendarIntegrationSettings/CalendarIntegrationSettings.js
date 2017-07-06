
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

  static async calendarsLoad() {
    try {
      const listCal = await listCalendars();
      return listCal;
    } catch (err) {
      console.log('err at CalendarsLoad', err);
      return null;
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      openModalCalSet: false,
      listCal: [],
      selectedCal: [],
    };
  }

  async componentWillMount() {
    const { openModalCalSet, curUser } = this.props;
    try {
      const listCal = await CalendarIntegrationSettings.calendarsLoad();
      this.setState({
        openModalCalSet,
        listCal,
        selectedCal: curUser.selectedCalendarsIds,
      });
    } catch (err) {
      console.log('err at componentWillMount CalendarIntegrationSettings', err);
    }
  }

  async componentWillReceiveProps(nextProps) {
    const { openModalCalSet } = nextProps;
    const { curUser } = this.props;
    try {
      const listCal = await this.constructor.calendarsLoad();
      this.setState({ openModalCalSet, listCal, selectedCal: curUser.selectedCalendarsIds });
    } catch (err) {
      console.log('err at componentWillReceiveProps CalendarIntegrationSettings', err);
    }
  }

  @autobind
  handleDialogClose() {
    this.props.cbToggleCalSetDialog();
  }

  @autobind
  handleCellClick(rowIndex) {
    const { selectedCal, listCal } = this.state;
    const nSelectedCal = _.cloneDeep(selectedCal);
    if (!selectedCal.includes(listCal[rowIndex].id)) {
      nSelectedCal.push(listCal[rowIndex].id);
    } else {
      _.pull(nSelectedCal, listCal[rowIndex].id);
    }
    this.setState({ selectedCal: nSelectedCal });
  }

  @autobind
  async handleSaveSetings() {
    const { selectedCal } = this.state;
    const { curUser, cbEditCurUser, cbToggleCalSetDialog } = this.props;
    const nCurUser = _.cloneDeep(curUser);
    const observeCurUser = jsonpatch.observe(nCurUser);
    nCurUser.selectedCalendarsIds = selectedCal;
    const patchesForAdd = jsonpatch.generate(observeCurUser);
    try {
      await cbEditCurUser(patchesForAdd);
      cbToggleCalSetDialog();
    } catch (err) {
      console.log('handleSaveSetings CalendarIntegration', err);
    }
  }

  renderTableRows() {
    const { listCal, selectedCal } = this.state;
    if (listCal.length === 0) return null;
    const rows = [];
    listCal.forEach((calendar) => {
      const calTitle = (calendar.primary) ? 'Primary' : calendar.summary;
      rows.push(
        <TableRow key={calendar.id} selected={selectedCal.includes(calendar.id)}>
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
  curUser: () => { console.log('curUser prop validation not set!'); },
};

CalendarIntegrationSettings.propTypes = {
  curUser: isCurUser,
  cbToggleCalSetDialog: PropTypes.func.isRequired,
  cbEditCurUser: PropTypes.func.isRequired,
  openModalCalSet: PropTypes.bool.isRequired,
};

export default CalendarIntegrationSettings;
