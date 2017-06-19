import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import Drawer from 'material-ui/Drawer';
import autobind from 'autobind-decorator';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Divider from 'material-ui/Divider';
import Clipboard from 'clipboard';
import { browserHistory } from 'react-router';
import Snackbar from 'material-ui/Snackbar';
import LinearProgress from 'material-ui/LinearProgress';
import SearchIcon from 'material-ui/svg-icons/action/search';
import Infinite from 'react-infinite';
import PropTypes from 'prop-types';
import _ from 'lodash';

import styles from './guest-invite.css';
import { checkStatus, parseJSON } from '../../util/fetch.util';
import { fullUrl } from './guestInviteDrawerUtils';
import { isEvent, isCurUser } from '../../util/commonPropTypes';
import UrlActions from './GuestInviteUrlActions';
import GuestInviveDrawerRows from './GuestInviteDrawerRows';

class GuestInviteDrawer extends Component {
  @autobind
  static handleEventLinkClick(id) {
    browserHistory.push(`/event/${id}`);
  }

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      guests: [],
      guestsToDisplay: [],
      activeCheckBoxes: [],
      snackbarOpen: false,
      snackbarMsg: '',
      linearProgressVisible: 'hidden',
      rowsCount: 0,
      setFocusFullUrl: true,
    };
    this.timer = undefined;
  }

  async componentWillMount() {
    try {
      const guests = await this.loadPastGuests();
      console.log('ghests', guests);
      const { open } = this.props;
      this.setState({ open, activeCheckBoxes: [], guests, guestsToDisplay: guests });
    } catch (err) {
      console.log('loadPastGuests GuestInviteDrawer', err);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { open } = nextProps;
    this.setState({ open, activeCheckBoxes: [], setFocusFullUrl: true });
  }

  async loadPastGuests() {
    const response = await fetch('/api/user/relatedUsers', { credentials: 'same-origin' });
    let guests;
    try {
      checkStatus(response);
      guests = await parseJSON(response);
      return guests;
    } catch (err) {
      console.log('loadPassGuests', err);
      this.setState({ snackbarOpen: true, snackbarMsg: 'Error!!, Failed to load guests. Please try again later.' });
      return [];
    }
  }

  @autobind
  handleCheck(id) {
    const { activeCheckBoxes } = this.state;
    let nActiveCheckBoxes = _.cloneDeep(activeCheckBoxes);
    if (nActiveCheckBoxes.includes(id)) {
      this.setState({ activeCheckBoxes: nActiveCheckBoxes.filter(x => x !== id) });
    } else {
      nActiveCheckBoxes = [...nActiveCheckBoxes, id];
      this.setState({ activeCheckBoxes: nActiveCheckBoxes });
    }
  }

  @autobind
  async handleInvite() {
    const { activeCheckBoxes } = this.state;
    const { curUser, event } = this.props;
    let nActiveCheckBoxes = _.cloneDeep(activeCheckBoxes);
    if (activeCheckBoxes.length > 0) {
      await Promise.all(
        activeCheckBoxes.map(async (guest) => {
          try {
            await this.props.cbInviteEmail(guest, event, curUser);
            nActiveCheckBoxes = nActiveCheckBoxes.filter(x => x !== guest);
          } catch (err) {
            console.log('err at handleInvitem GuestInviteDrawer', err);
            this.setState({ snackbarOpen: true, snackbarMsg: 'Error!!, sending invite for guest' });
          } finally {
            this.setState({ activeCheckBoxes: nActiveCheckBoxes });
          }
        }),
      );
    } else {
      this.setState({ snackbarOpen: true, snackbarMsg: 'Error!!, Please select guests to invite.' });
    }
  }

  @autobind
  handleCopyButtonClick(ev) {
    const { event } = this.props;
    const clipboard = new Clipboard(ev.target, {
      target: () => document.getElementById('fullUrl'),
    });

    clipboard.on('success', (e) => {
      this.setState({ snackbarOpen: true, snackbarMsg: `${event.name} link copied to clipboard!` });
      e.clearSelection();
    });
  }

  @autobind
  handleSearchTextChange(ev) {
    const searchString = ev.target.value.trim().toLowerCase();
    const { guests } = this.state;
    let newGuests = guests.slice(0);
    if (searchString.length > 0) {
      newGuests = newGuests.filter(guest => guest.userId.name.toLowerCase().match(searchString));
    }
    this.setState({ guestsToDisplay: newGuests });
  }

  @autobind
  handleOnRequestChange(open) {
    this.setState({ open });
    this.props.cb(open);
  }

  @autobind
  handleSendEmail(ev) {
    if (typeof this.props.event === 'undefined') {
      ev.preventDefault();
      this.setState({ snackbarOpen: true, snackbarMsg: 'error generating email body! Please try reload the page' });
    }
  }

  /* renderRows() {
    const { activeCheckBoxes, guestsToDisplay } = this.state;
    const inLineStyles = { listItem: { borderBottom: '1px solid #D4D4D4' } };
    const rows = [];
    guestsToDisplay.forEach((guest) => {
      const row = (
        <ListItem
          style={inLineStyles.listItem}
          key={`${guest._id}.listItem`}
          primaryText={guest.userId.name}
          leftCheckbox={<Checkbox
            onCheck={() => this.handleCheck(guest.userId._id)}
            checked={activeCheckBoxes.includes(guest.userId._id)}
          />}
          rightAvatar={<Avatar src={guest.userId.avatar} alt={nameInitials(guest.userId.name)} />}
        />
      );
      rows.push(row);
    });
    return rows;
  }*/

  renderUrlActions() {
    const { event } = this.props;
    const focusUrlTextField = (input) => {
      if (input && this.state.setFocusFullUrl) {
        this.setState({ setFocusFullUrl: false });
        setTimeout(() => { input.focus(); input.select(); }, 100);
      }
    };
    return (
      <div>
        <TextField
          id="fullUrl"
          styleName="textUrl"
          value={fullUrl(event)}
          underlineShow={false}
          fullWidth
          label="Full Url"
          ref={focusUrlTextField}
          aria-label="Full Url"
        />
        <UrlActions
          event={event}
          handleSendEmail={ev => this.handleSendEmail(ev)}
          handleCopyButtonClick={ev => this.handleCopyButtonClick(ev)}
        />
      </div>
    );
  }

  renderSnackBar() {
    const { snackbarOpen, snackbarMsg } = this.state;
    return (
      <Snackbar
        styleName="Snackbar"
        bodyStyle={{ height: 'flex' }}
        contentStyle={{ borderBottom: '0.2px solid' }}
        open={snackbarOpen}
        message={snackbarMsg}
        action="Dismiss"
        autoHideDuration={3000}
        onActionTouchTap={() => this.setState({ snackbarOpen: false })}
        onRequestClose={this.handleSnackbarRequestClose}
      />
    );
  }

  render() {
    const {
      open, searchText, linearProgressVisible, guestsToDisplay, activeCheckBoxes } = this.state;
    const { event } = this.props;
    const inLineStyles = {
      container: { paddingLeft: '9px', paddingRight: '10px' },
      textField: { floatingLabel: { fontSize: '15px', paddingLeft: 8 } },
      linearProgress: { visibility: linearProgressVisible },
    };

    return (
      <Drawer
        docked={false}
        width={350}
        open={open}
        onRequestChange={open => this.handleOnRequestChange(open)}
        containerStyle={inLineStyles.container}
      >
        <LinearProgress style={inLineStyles.linearProgress} />
        <h3 styleName="header"> {event.name} </h3>
        {this.renderUrlActions()}
        <Divider styleName="Divider" />
        <h6 styleName="inviteEventText">Recent Guests</h6>
        <div styleName="Row">
          <SearchIcon styleName="searchIcon" />
          <TextField
            floatingLabelStyle={inLineStyles.textField.floatingLabel}
            fullWidth
            label="Search Guests"
            floatingLabelText="Search guests"
            value={searchText}
            onChange={this.handleSearchTextChange}
            inputStyle={{ WebkitBoxShadow: '0 0 0 1000px white inset' }}
          />
        </div>
        <Infinite elementHeight={58} containerHeight={174}>
          <GuestInviveDrawerRows
            guestsToDisplay={guestsToDisplay}
            activeCheckBoxes={activeCheckBoxes}
            handleCheck={this.handleCheck}
          />
        </Infinite>
        <RaisedButton label="Invite" styleName="inviteButton" onTouchTap={this.handleInvite} fullWidth primary />
        {this.renderSnackBar()}
      </Drawer>
    );
  }
}

GuestInviteDrawer.defaultProps = {
  open: false,
  event: () => { console.log('event prop validation not set!'); },
  curUser: () => { console.log('curUser prop validation not set!'); },
};

GuestInviteDrawer.propTypes = {
  // Current user
  curUser: isCurUser,
  open: PropTypes.bool,
  cb: PropTypes.func.isRequired,
  cbInviteEmail: PropTypes.func.isRequired,

  // Event containing list of event participants
  event: isEvent,
};

export default cssModules(GuestInviteDrawer, styles);

