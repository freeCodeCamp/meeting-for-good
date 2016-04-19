import React from "react";
import CSSModules from 'react-css-modules';
import styles from '../styles/main';
import MeetingEvent from "../components/MeetingEvent";
import fetch from 'isomorphic-fetch';
import { checkStatus, parseJSON } from '../util/fetch.util';

class MeetingDetails extends React.Component {
    constructor(){
        super();
        this.state = { meetings: [] }
    }
    componentDidMount(){
        fetch('/api/meetings')
          .then(checkStatus)
          .then(parseJSON)
          .then(meetings => {
              meetings.forEach(meeting => {
                  if(meeting.uid === this.props.params.uid){
                      this.setState({meetings: [meeting]})
                  }
              })
          });
    }
    render(){
        return (
            <div>
                {
                  this.state.meetings.map(meeting => (
                    <MeetingEvent key={meeting._id} meeting={meeting} />
                  ))
                }
            </div>
        );
    }
}

export default CSSModules(MeetingDetails, styles);
