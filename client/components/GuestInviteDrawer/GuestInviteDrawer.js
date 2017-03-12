import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import Drawer from 'material-ui/Drawer';
import autobind from 'autobind-decorator';
import { List, ListItem } from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import nprogress from 'nprogress';
import Avatar from 'material-ui/Avatar';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Divider from 'material-ui/Divider';
import Copy from 'material-ui/svg-icons/content/content-copy';
import IconButton from 'material-ui/IconButton';
import Clipboard from 'clipboard';
import { browserHistory } from 'react-router';
import FlatButton from 'material-ui/FlatButton';
import Snackbar from 'material-ui/Snackbar';
import LinearProgress from 'material-ui/LinearProgress';
import SearchIcon from 'material-ui/svg-icons/action/search';

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
    };
    this.timer = undefined;
  }

  async componentWillMount() {
    await this.loadPastGuests();
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
    const clipboard = new Clipboard('.btn');
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
    const styles = {
      divider: {
        width: '100%',
      },
    };
    const rows = [];
    guestsToDisplay.forEach((guest) => {
      const row = (
        <div key={guest._id}>
          <ListItem
            primaryText={guest.name}
            leftCheckbox={<Checkbox onCheck={() => this.handleCheck(guest.userId)} checked={activeCheckboxes.includes(guest.userId)} />}
            rightAvatar={<Avatar src={guest.avatar} />}
          />
          <Divider style={styles.divider} />
        </div>
      );
      rows.push(row);
    });
    return rows;
  }

  render() {
    const { open, event, snackbarOpen, searchText, snackbarMsg, linearProgressVisible } = this.state;
    const fullUrl = `${location.protocol}//${location.hostname}${(location.port ? `:${location.port}` : '')}/event/${event._id}`;
    const styles = {
      drawer: {
        textField: {
          paddingTop: 0,
          paddingBottom: 0,
          margin: 0,
          floatingLabel: {
            fontSize: '24px',
            paddingLeft: 8,
          },
        },
        divider: {
          width: '100%',
          backgroundColor: '#000000',
        },
        copyButtom: {
          width: 28,
          height: 28,
          padding: 0,
          marginBottom: '10px',
          marginLeft: '7px',
          marginRight: '7px',
          icon: {
            width: 22,
            height: 22,
            paddingBottom: '3px',
          },
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

    return (
      <Drawer
        docked={false}
        width={300}
        open={open}
        onRequestChange={open => this.handleOnRequestChange(open)}
      >
        <h3 styleName="header"> This is event</h3>
        <h3 styleName="header"> {event.name} </h3>
        <h6 styleName="subHeader"> You can invite new guests coping
          <IconButton
            className="btn"
            style={styles.drawer.copyButtom}
            data-clipboard-text={fullUrl}
            onTouchTap={this.ClipBoard}
            iconStyle={styles.drawer.copyButtom.icon}
            tooltip="click to copy Url"
            tooltipPosition="top-left"
          >
            <Copy />
          </IconButton>
          the address for the event:
          <FlatButton
            onClick={() => this.handleEventLinkClick(event._id)}
            primary={true}
            label={' '}
          >
            {event.name}
          </FlatButton>
        </h6>
        <Divider style={styles.drawer.divider} />
        <h6 styleName="subHeader"> That&#39;s yours recent guests. If you want, we can invite some for you </h6>
        <RaisedButton
          fullWidth={true}
          label="Invite"
          primary={true}
          onTouchTap={this.handleInvite}
        />
        <div styleName="Row">
          <SearchIcon />
          <TextField
            style={styles.drawer.textField}
            floatingLabelStyle={styles.drawer.textField.floatingLabel}
            fullWidth={false}
            floatingLabelText="Search for Guests"
            value={searchText}
            onChange={this.handleSearchTextChange}
          />
        </div>
        <LinearProgress style={styles.linearProgress} />
        <List>
          {this.renderRows()}
        </List>
        <Snackbar
          style={styles.snackbar}
          bodyStyle={styles.snackbar.bodyStyle}
          contentStyle={styles.snackbar.contentStyle}
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

