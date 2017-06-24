
import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import PropTypes from 'prop-types';

import enteravailGif from '../../assets/enteravail.gif';

const actions = cbOpenModal => [<FlatButton label="close" primary onTouchTap={cbOpenModal} />];

const inlineStyles = {
  modal: {
    content: { width: '510px', maxWidth: '510px', minHeight: '510px' },
    bodyStyle: { paddingTop: '10px', fontSize: '25px' },
  },
};

const DialogInstructions = (props) => {
  const { cbOpenModal, openModal } = props;
  return (
    <Dialog
      contentStyle={inlineStyles.modal.content}
      bodyStyle={inlineStyles.modal.bodyStyle}
      actions={actions(cbOpenModal)}
      modal
      open={openModal}
    >
      <h4>This is how you can enter and remove your availablity:</h4>
      <img src={enteravailGif} alt="entering availablity gif" />
    </Dialog>
  );
};

DialogInstructions.propTypes = {
  cbOpenModal: PropTypes.func.isRequired,
  openModal: PropTypes.bool.isRequired,
};

export default DialogInstructions;
