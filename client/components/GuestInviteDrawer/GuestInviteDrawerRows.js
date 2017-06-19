import React from 'react';
import Avatar from 'material-ui/Avatar';
import { ListItem } from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import Infinite from 'react-infinite';
import PropTypes from 'prop-types';

import nameInitials from '../../util/string.utils';

const GuestInviveDrawerRows = (props) => {
  const { guestsToDisplay, activeCheckBoxes, handleCheck } = props;
  const rows = [];
  guestsToDisplay.forEach((guest) => {
    const row = (
      <ListItem
        style={{ borderBottom: '1px solid #D4D4D4' }}
        key={`${guest._id}.listItem`}
        primaryText={guest.userId.name}
        leftCheckbox={
          <Checkbox
            onCheck={() => handleCheck(guest.userId._id)}
            checked={activeCheckBoxes.includes(guest.userId._id)}
          />}
        rightAvatar={<Avatar src={guest.userId.avatar} alt={nameInitials(guest.userId.name)} />}
      />
    );
    rows.push(row);
  });
  return (
    <Infinite elementHeight={58} containerHeight={174}>
      {rows}
    </Infinite >
  );
};

GuestInviveDrawerRows.propTypes = {
  guestsToDisplay: PropTypes.arrayOf(PropTypes.object).isRequired,
  activeCheckBoxes: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleCheck: PropTypes.func.isRequired,
};

export default GuestInviveDrawerRows;
