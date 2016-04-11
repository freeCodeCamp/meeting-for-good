import React from 'react';
import moment from 'moment';

import DefaultLayout from './layouts/default';

export default class Dashboard extends React.Component {
  render() {
    return (
      <DefaultLayout title="Lets Meet">
        <div className="row">
        {this.props.meetings.map(meeting => (
            <div className="col s6 m3">
            <div className="card">
                <h4>{meeting.name}</h4>
                <div className="card-content">
                    <p><i className="material-icons">date_range</i>{moment(meeting.preferredDate).format('Do MMMM YYYY')}</p>
                    <p><i className="material-icons">alarm</i>{meeting.preferredTime}</p>
                </div>
                <div>
                    <h5>Participants</h5>
                   {meeting.participants.map(participant => (
                     <div className="participant">
                       <img src={participant.avatar} />
                       {participant.name}
                     </div>
                   ))}
                 </div>
                <div className="card-action">
                  <a href="#">This is a link</a>
                </div>
              </div>
            </div>
        ))}
        </div>
      </DefaultLayout>
    );
  }
}

Dashboard.propTypes = {
  meetings: React.PropTypes.array,
};
