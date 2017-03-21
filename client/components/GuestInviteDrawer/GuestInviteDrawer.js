import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import Drawer from 'material-ui/Drawer';
import autobind from 'autobind-decorator';
import { ListItem } from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import nprogress from 'nprogress';
import Avatar from 'material-ui/Avatar';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Divider from 'material-ui/Divider';
import Clipboard from 'clipboard';
import { browserHistory } from 'react-router';
import FlatButton from 'material-ui/FlatButton';
import Snackbar from 'material-ui/Snackbar';
import LinearProgress from 'material-ui/LinearProgress';
import SearchIcon from 'material-ui/svg-icons/action/search';
import Infinite from 'react-infinite';

import styles from './guest-invite.css';
import { checkStatus, parseJSON } from '../../util/fetch.util';

class GuestInviteDrawer extends Component {
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
    this.setState({ event, open, curUser, activeCheckboxes: [] });
  }

  async loadPastGuests() {
    nprogress.start();
    const response = await fetch('/api/user/relatedUsers', { credentials: 'same-origin' });
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
      nprogress.done();
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
    const response = await fetch(`/api/user/${_id}`, { credentials: 'same-origin' });
    try {
      checkStatus(response);
      return await parseJSON(response);
    } catch (err) {
      console.log('loadUserData', err);
      this.setState({
        snackbarOpen: true,
        snackbarMsg: 'Error!!, Failed to load user Data. Please try again later.',
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
        linearProgressVisible: 'hidden',
      }), 5000);
    } catch (err) {
      console.log('sendEmailOwner', err);
      this.setState({
        snackbarOpen: true,
        snackbarMsg: `Error!!, Failed to send invite to ${curUser.name} Please try again later.`,
      });
    }
  }

  @autobind
  ClipBoard() {
    const { event } = this.state;
    const clipboard = new Clipboard('.cpBtn');
    clipboard.on('success', (e) => {
      this.setState({
        snackbarOpen: true,
        snackbarMsg: `Info!!, url for ${event.name} copied!`,
        linearProgressVisible: 'hidden',
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

  @autobind
  handleEventLinkClick(id) {
    browserHistory.push(`/event/${id}`);
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
    const { open, event, snackbarOpen, searchText, snackbarMsg, linearProgressVisible, guestsToDisplay } = this.state;
    const fullUrl = `${location.protocol}//${location.hostname}${(location.port ? `:${location.port}` : '')}/event/${event._id}`;
    let lines = 800;
    if (guestsToDisplay.length > 10) {
      lines = 450;
    } else if (guestsToDisplay.length > 0) {
      lines = guestsToDisplay.length * 58;
    }
    const inLineStyles = {
      drawer: {
        container: {
          paddingLeft: '9px',
          paddingRight: '10px',
        },
        textField: {
          floatingLabel: {
            fontSize: '20px',
            paddingLeft: 8,
          },
        },
        divider: {
          width: '100%',
          backgroundColor: '#BDBDBD',
          marginTop: 6,

        },
        textUrl: {
          backgroundColor: '#F5F5F5',
          maxHeight: 40,
          minWidth: 275,
          marginRight: 0,
        },
        copyButton: {
          backgroundColor: 'white',
          label: {
            padding: 0,
            margin: 0,
            fontSize: '14px',
          },
        },
        inviteButton: {
          paddingTop: '15px',
        },
      },
      snackbar: {
        height: 'flex',
        bodyStyle: {
          height: 'flex',
        },
        contentStyle: {
          color: '#FF4081',
          borderBottom: '0.2px solid',
        },
      },
      linearProgress: {
        visibility: linearProgressVisible,
      },
    };
    const emailText = `Hey there,%0D%0A%0D%0AUsing the following tool, please block your availability for ${event.name}:
    %0D%0A%0D%0A${fullUrl} 
    %0D%0A%0D%0A All times will automatically be converted to your local timezone.`;
    return (
      <Drawer
        docked={false}
        width={350}
        open={open}
        onRequestChange={open => this.handleOnRequestChange(open)}
        containerStyle={inLineStyles.drawer.container}
      >
        <LinearProgress style={inLineStyles.linearProgress} />
        <h3 styleName="header"> {event.name} </h3>
        <TextField
          id="fullUrl"
          style={inLineStyles.drawer.textUrl}
          value={fullUrl}
          underlineShow={false}
          fullWidth
        />
        <div styleName="Row">
          <FlatButton
            className="cpBtn"
            styleName="copyButton"
            style={inLineStyles.drawer.copyButton}
            labelStyle={inLineStyles.drawer.copyButton.label}
            data-clipboard-text={fullUrl}
            onTouchTap={this.ClipBoard}
            label="copy link"
          />
          <p styleName="subHeader">
            or send a <a href={`mailto:?subject=Schedule ${event.name}&body=${emailText}`}>email</a>
          </p>
        </div>
        <Divider style={inLineStyles.drawer.divider} />
        <h6 styleName="InviteEventText"> Recent Guests </h6>
        <div styleName="Row">
          <SearchIcon styleName="searchIcon" />
          <TextField
            style={inLineStyles.drawer.textField}
            floatingLabelStyle={inLineStyles.drawer.textField.floatingLabel}
            fullWidth
            floatingLabelText="Search guests"
            value={searchText}
            onChange={this.handleSearchTextChange}
          />
        </div>
        <Infinite elementHeight={58} containerHeight={lines}>
          {this.renderRows()}
        </Infinite>
        <RaisedButton
          fullWidth
          label="Invite"
          primary
          style={inLineStyles.drawer.inviteButton}
          onTouchTap={this.handleInvite}
        />
        <Snackbar
          style={inLineStyles.snackbar}
          bodyStyle={inLineStyles.snackbar.bodyStyle}
          contentStyle={inLineStyles.snackbar.contentStyle}
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

