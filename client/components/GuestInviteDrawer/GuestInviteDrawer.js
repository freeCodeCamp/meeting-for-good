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

import styles from './guest-invite.css';
import { checkStatus, parseJSON } from '../../util/fetch.util';

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
      activeCheckboxes: [],
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
    this.setState({ event, open, curUser, activeCheckboxes: [] });
  }

  componentWillReceiveProps(nextProps) {
    const { event, open, curUser } = nextProps;
    this.setState({ event, open, curUser, activeCheckboxes: [], setFocusFullUrl: true });
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

  handleCheck(id) {
    const { activeCheckboxes } = this.state;
    const found = activeCheckboxes.includes(id);
    if (found) {
      this.setState({
        activeCheckboxes: activeCheckboxes.filter(x => x !== id),
      });
    } else {
      this.setState({
        activeCheckboxes: [...activeCheckboxes, id],
      });
    }
  }

  async loadUserData(_id) {
    const response = await fetch(`/api/user/${_id}`, {
      credentials: 'same-origin',
    });

    try {
      checkStatus(response);
      return await parseJSON(response);
    } catch (err) {
      console.log('loadUserData', err);
      this.setState({
        snackbarOpen: true,
        snackbarMsg: 'Failed to load user data. Please try again later.',
      });
      return null;
    }
  }

  @autobind
  handleInvite() {
    this.timer = undefined;
    const { activeCheckboxes } = this.state;
    if (activeCheckboxes.length > 0) {
      activeCheckboxes.forEach((guest) => {
        this.sendEmailInvite(guest);
      });
      this.setState({ activeCheckboxes: [] });
    } else {
      this.setState({
        snackbarOpen: true,
        snackbarMsg: 'Error!!, Please select guests to invite.',
      });
    }
  }

  async sendEmailInvite(guestId) {
    this.setState({ linearProgressVisible: 'visible' });
    const { event, curUser } = this.state;
    const fullUrl = `${location.protocol}//${location.hostname}${(location.port ? `:${location.port}` : '')}`;

    const guestData = await this.loadUserData(guestId);
    const msg = {
      guestName: guestData.name,
      eventName: event.name,
      eventId: event._id,
      eventOwner: event.owner,
      eventOwnerName: curUser.name,
      url: `${fullUrl}/event/${event._id}`,
      to: guestData.emails[0],
      subject: `Invite for ${event.name}!!`,
    };
    const response = await fetch('/api/email/sendInvite', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      method: 'POST',
      body: JSON.stringify(msg),
    });

    try {
      checkStatus(response);
      this.timer = setTimeout(this.setState({
        snackbarOpen: true,
        snackbarMsg: `Info!!, ${guestData.name} invited! to ${event.name}`,
      }), 5000);
    } catch (err) {
      console.log('sendEmailOwner', err);
      this.setState({
        snackbarOpen: true,
        snackbarMsg: `Failed to send invite to ${curUser.name}. Please try again later.`,
      });
    } finally {
      this.setState({ linearProgressVisible: 'hidden' });
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
      newGuests = newGuests.filter((guest) => {
        return guest.name.toLowerCase().match(searchString);
      });
    }
    this.setState({ guestsToDisplay: newGuests });
  }

  @autobind
  handleOnRequestChange(open) {
    this.setState({ open });
    this.props.cb(open);
  }

  renderRows() {
    const { activeCheckboxes, guestsToDisplay } = this.state;
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
          primaryText={guest.name}
          leftCheckbox={<Checkbox
            onCheck={() => this.handleCheck(guest.userId)}
            checked={activeCheckboxes.includes(guest.userId)}
          />}
          rightAvatar={<Avatar src={guest.avatar} />}
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
            color: '#ffffff',
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
          ref={focusUrlTextField}
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

GuestInviteDrawer.propTypes = {
  event: React.PropTypes.object,
  curUser: React.PropTypes.object,
  open: React.PropTypes.bool,
  cb: React.PropTypes.func,
};

export default cssModules(GuestInviteDrawer, styles);

