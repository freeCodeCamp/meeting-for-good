import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import autobind from 'autobind-decorator';
import { List, ListItem } from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import nprogress from 'nprogress';
import Avatar from 'material-ui/Avatar';
import TextField from 'material-ui/TextField';

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
    };
  }

  async componentWillMount() {
    await this.loadPassGuests();
  }

  componentWillReceiveProps(nextProps) {
    const { event, open, curUser } = nextProps;
    this.setState({ event, open, curUser });
  }

  addNotification(msgTitle, msg, dismissTime = 3400) {
    const { notifications, count } = this.state;
    const newCount = count + 1;
    const msgKey = count + 1;

    return this.setState({
      count: newCount,
      notifications: notifications.add({
        message: msg,
        title: msgTitle,
        key: msgKey,
        action: 'Dismiss',
        dismissAfter: dismissTime,
        onClick: () => this.removeNotification(msgKey),
      }),
    });
  }

  removeNotification(key) {
    const { notifications } = this.state;
    this.setState({
      notifications: notifications.filter(n => n.key !== key),
    });
  }

  async loadPassGuests() {
    nprogress.start();
    const response = await fetch('/api/user/relatedUsers', { credentials: 'same-origin' });
    let guests;
    try {
      checkStatus(response);
      guests = await parseJSON(response);
      this.setState({ guests });
    } catch (err) {
      console.log('loadPassGuests' , err);
      this.addNotification('Error!!', 'Failed to load guests. Please try again later.');
      return;
    } finally {
      nprogress.done();
      this.setState({ showNoScheduledMessage: true });
    }
  }

  @autobind
  handleClose() {
    this.setState({ open: false });
  }

  renderRows() {
    console.log('opa');
    const { guests } = this.state;
    const rows = [];
    guests.forEach((guest) => {
      const row = (
        <ListItem
          primaryText={guest.name}
          leftCheckbox={<Checkbox />}
          rightAvatar={<Avatar src={guest.avatar} />}
        />
      );
      rows.push(row);
    });
    return rows;
  }

  render() {
    const { open } = this.state;
    return (
      <Drawer
        docked={false}
        width={300}
        open={open}
        onRequestChange={open => this.setState({ open })}
      >
        <h6> That's a list of your recent guests, if you want we can invite some for you </h6>
        <TextField
          fullWidth={true}  
          hintText="search"
          floatingLabelText="Search for Guests"
        />
        <List>
          {this.renderRows()}
        </List>
        
        <MenuItem onTouchTap={this.handleClose}>Menu Item 2</MenuItem>
      </Drawer>
    );
  }
}

GuestInviteDrawer.propTypes = {
  event: React.PropTypes.object,
  curUser: React.PropTypes.object,
  open: React.PropTypes.bool,
};

export default cssModules(GuestInviteDrawer, styles);

