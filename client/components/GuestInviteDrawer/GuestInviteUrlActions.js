import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import cssModules from 'react-css-modules';
import PropTypes from 'prop-types';

import styles from './guest-invite.css';
import { emailText } from './guestInviteDrawerUtils';
import { isEvent } from '../../util/commonPropTypes';

const UrlActions = (props) => {
  const { event, handleCopyButtonClick, handleSendEmail } = props;
  return (
    <div styleName="Row">
      <RaisedButton
        styleName="copyAndEmailButton"
        className="cpBtn"
        primary
        onTouchTap={ev => handleCopyButtonClick(ev)}
        label="Copy Link"
      />
      <RaisedButton
        styleName="copyAndEmailButton"
        label="Send Email Invite"
        primary
        onTouchTap={ev => handleSendEmail(ev)}
        href={`mailto:?subject=Share your availability for ${event.name}&body=${emailText(event)}`}
      />
    </div>
  );
};

UrlActions.defaultProps = {
  event: () => { console.log('event prop validation not set!'); },
};


UrlActions.propTypes = {
  handleCopyButtonClick: PropTypes.func.isRequired,
  handleSendEmail: PropTypes.func.isRequired,

  event: isEvent,
};
export default cssModules(UrlActions, styles);
