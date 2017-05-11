import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import Snackbar from 'material-ui/Snackbar';
import FontIcon from 'material-ui/FontIcon';
import TumbUp from 'material-ui/svg-icons/action/thumb-up';
import TumbDown from 'material-ui/svg-icons/action/thumb-down';
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

    const inlineStyles = {
      backgroundColor: 'transparent',
      maxWidth: '40%',
      tableHeader: {
        tableRow: {
          tableHeaderColumn: {
            textAlign: 'center',
            fontSize: '30px',
            color: '#FFFFFF',
            textDecoration: 'underline',
            iconStyles: {
              margin: 0,
            },
          },
        },
      },
      tableBody: {
        tableRowColumn: {
          textAlign: 'center',
          border: 'none',
          fontSize: '15px',
          color: '#ffffff',
        },
      },
    };
    return (
      <div styleName="row">
        <Table
          style={inlineStyles}
          selectable={false}
        >
          <TableHeader
            style={inlineStyles.tableHeader}
            displaySelectAll={false}
          >
            <TableRow>
              <TableHeaderColumn
                style={inlineStyles.tableHeader.tableRow.tableHeaderColumn}
              >
                <TumbUp
                  size={40}
                  color={'#ffffff'}
                />
              </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            displayRowCheckbox={false}
          >{guests.map(guest =>
            (
              <TableRow
                key={guest}
              >
                <TableRowColumn
                  style={inlineStyles.tableBody.tableRowColumn}
                >
                  {guest}
                </TableRowColumn>
              </TableRow>
            ))
          }
          </TableBody>
        </Table>
        <Table
          style={inlineStyles}
          selectable={false}
        >
          <TableHeader
            style={inlineStyles.tableHeader}
            displaySelectAll={false}
          >
            <TableRow>
              <TableHeaderColumn
                style={inlineStyles.tableHeader.tableRow.tableHeaderColumn}
              >
                <TumbDown
                  size={40}
                  color={'#ffffff'}
                />
              </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            displayRowCheckbox={false}
          >{noGuests.map(guest =>
            (
              <TableRow
                key={guest}
              >
                <TableRowColumn
                  style={inlineStyles.tableBody.tableRowColumn}
                >
                  {guest}
                </TableRowColumn>
              </TableRow>
            ))
          }
          </TableBody>
        </Table>
      </div>
    );
  }

  render() {
    const { openSnackBar, guests, noGuests } = this.props;
    const heightCalc = 60 +
      ((guests.length > noGuests.length) ? guests.length * 50 : noGuests.length * 50);
    console.log(heightCalc);
    const inlineStyles = {
      minHeight: `${heightCalc}px`,
      bodyStyle: {
        height: `${heightCalc}px`,
      },
    };

    return (
      <Snackbar
        bodyStyle={inlineStyles.bodyStyle}
        open={openSnackBar}
        message={this.createMsgSnackBar()}
        autoHideDuration={30000}
        onRequestClose={this.handleRequestClose}
      />
    );
  }
}

SnackBarGrid.propTypes = {
  guests: PropTypes.arrayOf(PropTypes.string).isRequired,
  noGuests: PropTypes.arrayOf(PropTypes.string).isRequired,
  openSnackBar: PropTypes.bool.isRequired,
};

export default cssModules(SnackBarGrid, styles);
