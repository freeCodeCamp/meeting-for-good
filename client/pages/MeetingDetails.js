import React from "react";
import CSSModules from 'react-css-modules';
import styles from '../styles/main';

class MeetingDetails extends React.Component {
    render() {
        const { uid } = this.props.params;
        return (
            <h1>Meeting UID: {uid}</h1>
        );
    }
}

export default CSSModules(MeetingDetails, styles);
