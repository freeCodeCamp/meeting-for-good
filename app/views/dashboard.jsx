import React from 'react';
import moment from 'moment';

import AccessTime from 'material-ui/lib/svg-icons/device/access-time';
import Avatar from 'material-ui/lib/avatar';
import Card from 'material-ui/lib/card/card';
import CardActions from 'material-ui/lib/card/card-actions';
import CardTitle from 'material-ui/lib/card/card-title';
import CardText from 'material-ui/lib/card/card-text';
import EventAvailable from 'material-ui/lib/svg-icons/notification/event-available';
import FlatButton from 'material-ui/lib/flat-button';

import DefaultLayout from './layouts/default';

export default class Dashboard extends React.Component {
  render() {
    return (
      <DefaultLayout title="Lets Meet">
        {this.props.meetings.map(meeting => (
          <Card className="card">
            <CardTitle title={meeting.name} />
            <CardText className="cardText">
              <div className="flex">
                <EventAvailable className="inline-icon" />
                {moment(meeting.preferredDate).format('Do MMMM YYYY')}
              </div>
              <br />
              <div className="flex">
                <AccessTime className="inline-icon" />
                {meeting.preferredTime}
              </div>
              <br />
              <div className="participantList">
                <h5>Participants</h5>
                <br />
                <div>
                  {meeting.participants.map(participant => (
                    <div className="participant flex">
                      <Avatar className="inline-icon" src={participant.avatar} />
                      {participant.name}
                    </div>
                  ))}
                </div>
              </div>
            </CardText>
            <CardActions>
              <FlatButton label="View Details" />
            </CardActions>
          </Card>
        ))}
      </DefaultLayout>
    );
  }
}

Dashboard.propTypes = {
  meetings: React.PropTypes.array,
};
