import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import Drawer from 'material-ui/Drawer';
import autobind from 'autobind-decorator';
import { ListItem } from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import Avatar from 'material-ui/Avatar';
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
import nameInitials from '../../util/string.utils';

class GuestInviteDrawer extends Component {
  @autobind
  static handleEventLinkClick(id) {
    browserHistory.push(`/event/${id}`);
  }

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      curUser: {},
      event: this.props.event,
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
    await this.loadPastGuests();
    const { event, open, curUser } = this.props;
    this.setState({ event, open, curUser, activeCheckBoxes: [] });
  }

  componentWillReceiveProps(nextProps) {
    const { event, open, curUser } = nextProps;
    this.setState({ event, open, curUser, activeCheckBoxes: [], setFocusFullUrl: true });
  }

  async loadPastGuests() {
    this.setState({ linearProgressVisible: 'visible' });

    const response = await fetch('/api/user/relatedUsers', {
      credentials: 'same-origin',
    });

    let guests;
    try {
      checkStatus(response);
      guests = await parseJSON(response);
      this.setState({ guests, guestsToDisplay: guests });
    } catch (err) {
      console.log('loadPassGuests', err);
      this.setState({
        snackbarOpen: true,
        snackbarMsg: 'Error!!, Failed to load guests. Please try again later.',
      });
      return;
    } finally {
      this.setState({ linearProgressVisible: 'hidden' });
    }
  }

  @autobind
  handleSnackbarRequestClose() {
    this.setState({ snackbarOpen: false });
  }

  @autobind
  handleCheck(id) {
    const { activeCheckBoxes } = this.state;
    let nActiveCheckBoxes = _.cloneDeep(activeCheckBoxes);
    if (nActiveCheckBoxes.includes(id)) {
      this.setState({
        activeCheckBoxes: nActiveCheckBoxes.filter(x => x !== id),
      });
    } else {
      nActiveCheckBoxes = [...nActiveCheckBoxes, id];
      this.setState({
        activeCheckBoxes: nActiveCheckBoxes,
      });
    }
  }

  @autobind
  async handleInvite() {
    const { activeCheckBoxes, curUser, event } = this.state;
    let nActiveCheckBoxes = _.cloneDeep(activeCheckBoxes);
    if (activeCheckBoxes.length > 0) {
      await Promise.all(
        activeCheckBoxes.map(async (guest) => {
          try {
            await this.props.cbInviteEmail(guest, event, curUser);
            nActiveCheckBoxes = nActiveCheckBoxes.filter(x => x !== guest);
          } catch (err) {
            console.log('err at handleInvitem GuestInviteDrawer', err);
            this.setState({
              snackbarOpen: true,
              snackbarMsg: 'Error!!, sending invite for guest',
            });
          } finally {
            this.setState({ activeCheckBoxes: nActiveCheckBoxes });
          }
        }),
      );
    } else {
      this.setState({
        snackbarOpen: true,
        snackbarMsg: 'Error!!, Please select guests to invite.',
      });
    }
  }

  @autobind
  handleCopyButtonClick(ev) {
    const { event } = this.state;
    const clipboard = new Clipboard(ev.target, {
      target: () => document.getElementById('fullUrl'),
    });

    clipboard.on('success', (e) => {
      this.setState({
        snackbarOpen: true,
        snackbarMsg: `${event.name} link copied to clipboard!`,
      });
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

  renderRows() {
    const { activeCheckBoxes, guestsToDisplay } = this.state;
    const inLineStyles = {
      listItem: {
        borderBottom: '1px solid #D4D4D4',
      },
    };
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
          rightAvatar={<Avatar
            src={guest.userId.avatar}
            alt={nameInitials(guest.userId.name)}
          />}
        />
      );
      rows.push(row);
    });
    return rows;
  }

  render() {
    const {
      open,
      event,
      snackbarOpen,
      searchText,
      snackbarMsg,
      linearProgressVisible,
    } = this.state;

    const fullUrl = `${location.protocol}//${location.hostname}${(location.port ? `:${location.port}` : '')}/event/${event._id}`;

    const focusUrlTextField = (input) => {
      if (input) {
        if (this.state.setFocusFullUrl) {
          this.setState({ setFocusFullUrl: false });
          setTimeout(() => {
            input.focus();
            input.select();
          }
            , 100);
        }
      }
    };
    const lines = 174;
    const inLineStyles = {
      drawer: {
        container: {
          paddingLeft: '9px',
          paddingRight: '10px',
        },
        textField: {
          floatingLabel: {
            fontSize: '15px',
            paddingLeft: 8,
          },
        },
        inviteButton: {
          paddingTop: '15px',
        },
        snackbar: {
          bodyStyle: {
            height: 'flex',
          },
          contentStyle: {
            borderBottom: '0.2px solid',
          },
        },
        linearProgress: {
          visibility: linearProgressVisible,
        },
      },
    };

    const emailText = `Hey there,%0D%0A%0D%0AUse this tool to let me know your availablility for ${event.name}:
    %0D%0A%0D%0A${fullUrl}
    %0D%0A%0D%0A All times will be automatically converted to your local timezone.`;

    return (
      <Drawer
        docked={false}
        width={350}
        open={open}
        onRequestChange={open => this.handleOnRequestChange(open)}
        containerStyle={inLineStyles.drawer.container}
      >
        <LinearProgress style={inLineStyles.drawer.linearProgress} />
        <h3 styleName="header"> {event.name} </h3>
        <TextField
          id="fullUrl"
          styleName="textUrl"
          value={fullUrl}
          underlineShow={false}
          fullWidth
          label="Full Url"
          ref={focusUrlTextField}
          aria-label="Full Url"
        />
        <div styleName="Row">
          <RaisedButton
            styleName="copyAndEmailButton"
            className="cpBtn"
            primary
            onTouchTap={this.handleCopyButtonClick}
            label="Copy Link"
          />
          <RaisedButton
            styleName="copyAndEmailButton"
            label="Send Email Invite"
            primary
            href={`mailto:?subject=Share your availability for ${event.name}&body=${emailText}`}
          />
        </div>
        <Divider styleName="Divider" />
        <h6 styleName="inviteEventText">Recent Guests</h6>
        <div styleName="Row">
          <SearchIcon styleName="searchIcon" />
          <TextField
            floatingLabelStyle={inLineStyles.drawer.textField.floatingLabel}
            fullWidth
            label="Search Guests"
            floatingLabelText="Search guests"
            value={searchText}
            onChange={this.handleSearchTextChange}
            inputStyle={{ WebkitBoxShadow: '0 0 0 1000px white inset' }}
          />
        </div>
        <Infinite elementHeight={58} containerHeight={lines}>
          {this.renderRows()}
        </Infinite>
        <RaisedButton
          label="Invite"
          styleName="inviteButton"
          onTouchTap={this.handleInvite}
          fullWidth
          primary
        />
        <Snackbar
          styleName="Snackbar"
          bodyStyle={inLineStyles.drawer.snackbar.bodyStyle}
          contentStyle={inLineStyles.drawer.snackbar.contentStyle}
          open={snackbarOpen}
          message={snackbarMsg}
          action="Dismiss"
          autoHideDuration={3000}
          onActionTouchTap={this.handleSnackbarRequestClose}
          onRequestClose={this.handleSnackbarRequestClose}
        />
      </Drawer>
    );
  }
}

GuestInviteDrawer.defaultProps = {
  open: false,
};

GuestInviteDrawer.propTypes = {
  // Current user
  curUser: PropTypes.shape({
    _id: PropTypes.string,      // Unique user id
    name: PropTypes.string,     // User name
    avatar: PropTypes.string,   // URL to image representing user(?)
  }).isRequired,

  open: PropTypes.bool,
  cb: PropTypes.func.isRequired,
  cbInviteEmail: PropTypes.func.isRequired,

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

export default cssModules(GuestInviteDrawer, styles);

