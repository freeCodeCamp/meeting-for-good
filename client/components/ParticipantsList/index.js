import React, { Component } from 'react';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';

class ParticipantsList extends Component {
  constructor(props) {
    super(props);
    const { event, curUser } = this.props;
    this.state = {
      event: (event !== undefined) ? event : null,
      curUser,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { curUser } = nextProps;
    this.setState({ curUser });
  }

  handleDelete() { 
    console.log('delete');
  }

  participantsLst() {
    const styles = {
      chip: {
        margin: 4,
        width: '100%',
        border: '0.5px solid #E0E0E0',
        backgroundColor: '#ECEFF1',
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
    const { event, curUser } = this.state;
    // console.log(event, curUser);
    const rows = [];
    event.participants.forEach((participant) => {
      let row;
      if (curUser._id === participant.userId) {
        row = (
          <Chip key={participant._id} style={styles.chip} onRequestDelete={this.handleDelete}>
            <Avatar src={participant.avatar} style={styles.avatar} />
            {participant.name}
          </Chip>
        );
      } else {
        row = (<Chip key={participant._id} style={styles.chip} >
          <Avatar src={participant.avatar} style={styles.avatar} />
          {participant.name}
        </Chip>
        );
      }
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
  curUser: React.PropTypes.object,
};

export default ParticipantsList;
