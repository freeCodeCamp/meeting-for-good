import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import Snackbar from 'material-ui/Snackbar';
import ThumbUp from 'material-ui/svg-icons/action/thumb-up';
import ThumbDown from 'material-ui/svg-icons/action/thumb-down';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import PropTypes from 'prop-types';

import styles from './snack-bar-grid.css';

class SnackBarGrid extends Component {

  createMsgSnackBar() {
    const { guests, noGuests } = this.props;
    const interactor = (guests.length > noGuests.length) ? guests : noGuests;

    const inlineStyles = {
      backgroundColor: 'transparent',
      maxWidth: '100%',
      tableHeader: {
        tableRow: {
          tableHeaderColumn: {
            textAlign: 'center',
            fontSize: '20px',
            color: '#000000',
            iconStyles: {
              margin: 0,
            },
          },
        },
      },
      tableBody: {
        tableRow: {
          borderBottom: 'none',
          borderTop: 'none',
          height: '30px',
          lineHeight: '30px',
          tableRowColumn: {
            height: '30px',
            lineHeight: '30px',
            textAlign: 'center',
            borderBottom: 'none',
            borderTop: 'none',
            fontSize: '15px',
            color: '#000000',
          },
        },
      },
    };
    return (
      <Table
        style={inlineStyles}
        selectable={false}
      >
        <TableHeader
          style={inlineStyles.tableHeader}
          displaySelectAll={false}
          adjustForCheckbox={false}
        >
          <TableRow>
            <TableHeaderColumn
              style={inlineStyles.tableHeader.tableRow.tableHeaderColumn}
            >
              <ThumbUp
                style={{ fontSize: '100px' }}
                viewBox="0 0 28 21"
                color={'#000000'}
              /> Available
            </TableHeaderColumn>
            <TableHeaderColumn
              style={inlineStyles.tableHeader.tableRow.tableHeaderColumn}
            >
              <ThumbDown
                style={{ fontSize: '24px' }}
                viewBox="0 0 28 21"
                color={'#000000'}
              /> Not Available
            </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody
          displayRowCheckbox={false}
        >{interactor.map((inter, index) =>
          (
            <TableRow
              key={`${inter} ${Math.random()}`}
              style={inlineStyles.tableBody.tableRow}
            >
              <TableRowColumn
                style={inlineStyles.tableBody.tableRow.tableRowColumn}
              >
                {guests[index]}
              </TableRowColumn>
              <TableRowColumn
                style={inlineStyles.tableBody.tableRow.tableRowColumn}
              >
                {noGuests[index]}
              </TableRowColumn>
            </TableRow>
          ))
        }
        </TableBody>
      </Table>

    );
  }

  render() {
    const { openSnackBar, guests, noGuests } = this.props;
    const heightCalc = 60 +
      ((guests.length > noGuests.length) ? guests.length * 30 : noGuests.length * 30);
    const inlineStyles = {
      border: '2px ridge #E0E0E0',
      width: '450px',
      bodyStyle: {
        display: 'flex',
        flexDirection: 'row',
        height: `${heightCalc}px`,
      },
    };

    return (
      <Snackbar
        style={inlineStyles}
        bodyStyle={inlineStyles.bodyStyle}
        open={openSnackBar}
        message={this.createMsgSnackBar()}
        autoHideDuration={30000000}
        onRequestClose={this.handleRequestClose}
      />
    );
  }
}

SnackBarGrid.propTypes = {
  guests: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
  noGuests: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
  openSnackBar: PropTypes.bool.isRequired,
};

export default cssModules(SnackBarGrid, styles);
