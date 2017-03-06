import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';

import styles from './guest-invite.css';

class GuestInviteDrawer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      curUser: {},
      event: this.props.event,

    };
  }

  componentWillReceiveProps(nextProps) {
    const { event, open } = nextProps;
    this.setState({ event, open });
  }

  handleClose() {
    this.setState({ open: false });
  }


  render() {
    return (
      <Drawer
        docked={false}
        width={200}
        open={open}
        onRequestChange={open => this.setState({ open })}
      >
        <MenuItem onTouchTap={this.handleClose}>Menu Item</MenuItem>
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

