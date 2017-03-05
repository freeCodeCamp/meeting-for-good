import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';

class ParticipantsList extends Component {
  constructor(props) {
    super(props);
    const { event } = this.props;
    this.state = {
      event: (event !== undefined) ? event : null,
    };
  }

  participantsLst() {
    const styles = {
      chip: {
        margin: 4,
        width: '100%',
      },
      wrapper: {
        display: 'flex',
        flexWrap: 'wrap',
      },
      avatar: {
        width: '40px',
        height: '40px',
      },
    };
    const { event } = this.state;
    const rows = [];
    event.participants.forEach((participant) => {
      const row = (
        <Chip key={participant._id} style={styles.chip}>
          <Avatar src={participant.avatar} style={styles.avatar} />
          {participant.name}
        </Chip>
      );
      rows.push(row);
    });
    return rows;
  }

  render() {
    return (
      <div>
        <h6><strong>Participants</strong></h6>
        {this.participantsLst()}
      </div>
    );
  }
}

ParticipantsList.propTypes = {
  event: React.PropTypes.object,
};

export default ParticipantsList;
