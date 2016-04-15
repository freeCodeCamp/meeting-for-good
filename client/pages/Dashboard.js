import React from 'react';
import moment from 'moment';
import fetch from 'isomorphic-fetch';
import CSSModules from 'react-css-modules';

import styles from '../styles/dashboard';

import { checkStatus, parseJSON } from '../util/fetch.util';

class Dashboard extends React.Component {
  constructor() {
    super();
    this.state = {
      meetings: [],
    };
  }

  componentDidMount() {
    fetch('/api/meetings')
      .then(checkStatus)
      .then(parseJSON)
      .then(meetings => {
        this.setState({ meetings });
      });

      $.get("/api/auth/current", (user) => {
          if(user === "")
              window.location.href = "/"
      })
  }

  render() {
    return (
      <div styleName="wrapper">
        <div className="card hoverable" styleName="new-meeting">
          <div className="card-content">
              <i
                className="material-icons activator large"
                styleName="new-meeting-icon"
              >
                note_add
              </i>
          </div>
          <div className="card-reveal">
            <span className="card-title" styleName="reveal-card-title">
              New Meeting
              <i className="material-icons right">close</i>
            </span>
            <form>
              <div className="row">
                <div className="col s12">
                  <div className="input-field">
                    <input id="name" type="text" className="validate" />
                    <label htmlFor="name">Meeting Name</label>
                  </div>
                  <input type="date" className="datepicker" />
                </div>
              </div>
            </form>
            <div className="card-action">
              <a href="#">Submit</a>
            </div>
          </div>
        </div>
        {this.state.meetings.map((meeting, index) => (
          <div className="card meeting" key={index} styleName="meeting">
            <div className="card-content">
              <span className="card-title">{meeting.name}</span>
              <p styleName="detail">
                <i className="material-icons" styleName="material-icons">date_range</i>
                {moment(meeting.preferredDate).format('Do MMMM YYYY')}
              </p>
              <p styleName="detail">
                <i className="material-icons" styleName="material-icons">alarm</i>
                {meeting.preferredTime}
              </p>
              <br />
              <div>
                <h6><strong>Participants</strong></h6>
                {meeting.participants.map(participant => (
                  <div className="participant" styleName="participant">
                    <img className="circle" styleName="participant-img" src={participant.avatar} />
                    {participant.name}
                  </div>
                ))}
              </div>
            </div>
            <div className="card-action">
              <a href="#">View Details</a>
            </div>
          </div>
        ))}
      </div>
    );
  }
}

export default CSSModules(Dashboard, styles);
