import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import cssModules from 'react-css-modules';

import PropTypes from 'prop-types';
import styles from './about-dialog.css';

const AboutDialog = (props) => {
  const { cbOpenModal, openModal } = props;
  const actions = [
    <FlatButton label="close" primary onTouchTap={() => cbOpenModal()} />,
  ];
  const inlineStyles = {
    modal: { content: { width: '630px', maxWidth: '630px' }, bodyStyle: { paddingTop: 10, fontSize: '25px' } },
  };
  return (
    <Dialog
      contentStyle={inlineStyles.modal.content}
      bodyStyle={inlineStyles.modal.bodyStyle}
      actions={actions}
      modal
      styleName="AboutDialog"
      open={openModal}
    >
      <h1 styleName="titleStyle">Meeting for Good</h1>
      <h6 styleName="versionStyle">Version {process.env.versionNumber}</h6>
      <h4 styleName="descStyle">THE BEST MEETING COORDINATION APP</h4>
      <h6>Created by campers from <a href="https://www.freecodecamp.com">FreeCodeCamp</a></h6>
      <h6><a href="https://github.com/freeCodeCamp/meeting-for-good/"> License and GitHub Repository</a></h6>
    </Dialog>
  );
};

AboutDialog.propTypes = {
  cbOpenModal: PropTypes.func.isRequired,
  openModal: PropTypes.bool.isRequired,
};

export default cssModules(AboutDialog, styles);

