import React from 'react';
import DayPicker, { DateUtils } from 'react-day-picker';
import cssModules from 'react-css-modules';
import moment from 'moment';

import styles from '../styles/event-card.css';
import 'react-day-picker/lib/style.css';

class EventCard extends React.Component {
  constructor(props) {
    super(props);
    props.event.dates = props.event.dates.map(date => {
      if (date.from !== null && date.to !== null) {
        date.from = moment(date.from).toDate();
        date.to = moment(date.to).toDate();
      }
      return date;
    });

    if (props.event.dates.length === 0) {
      delete props.event.dates;
    } else if (props.event.weekDays === undefined) {
      delete props.event.weekDays;
    }

    this.state = {
      participants: props.event.participants,
      ranges: props.event.dates,
    };
  }

  componentDidMount(){
    $(".participant-list").each((i,el) => {
      if($(el).children().length === 1){
        $(el).append("<em>No one has been added yet.</em>")
      }
    })

    const participants = this.state.participants;
    let meetArray = [];
    let bestTimes = {};

    for(let i = 0; i < participants.length; i++){
      if(participants[i].availibility){
        meetArray.push(participants[i].availibility);
      }
    }

    for(let b in meetArray[0]){
        bestTimes[meetArray[0][b].date] = [];
    }

    for(let j = 0; j < meetArray.length; j++){
      for(let k = 0; k < meetArray[j].length; k++){
        if(meetArray[j+1] !== undefined){
          if(meetArray[j][k].date === meetArray[j+1][k].date){
            for(let l = 0; l < meetArray[j+1][k].hours.length; l++){
              meetArray[j][k].hours.push(meetArray[j+1][k].hours[l]);
            }
          }
        }
      }
    }
    meetArray = meetArray.shift();
    console.log(meetArray)
    for(let i = 0; i < meetArray.length; i++){
      let temp = meetArray[i].hours.sort();
      for(let z = 0; z < temp.length; z++){
        if(temp[z] === temp[z+1]){
          bestTimes[meetArray[i].date].push(temp[z]);
        }
      }
    }

    console.log("Best time to meet on " + Object.keys(bestTimes)[0] + " is: " + bestTimes[Object.keys(bestTimes)[0]])
    console.log("Best time to meet on " + Object.keys(bestTimes)[1] + " is: " + bestTimes[Object.keys(bestTimes)[1]])
    console.log("Best time to meet on " + Object.keys(bestTimes)[2] + " is: " + bestTimes[Object.keys(bestTimes)[2]])
  }

  render() {
    const modifiers = {
      selected: day =>
        DateUtils.isDayInRange(day, this.state) ||
        this.state.ranges.some(v => DateUtils.isDayInRange(day, v)),
    };

    const { event } = this.props;

    return (
      <div className="card" styleName="event">
        <div className="card-content">
          <span className="card-title">{event.name}</span>
          <div className="row">
            <div className="col s12">
              {event.dates ?
                <DayPicker
                  fromMonth={new Date()}
                  modifiers = { modifiers }
                /> :
                Object.keys(event.weekDays).map((day, index) => {
                  let className = 'btn-flat';
                  if (!event.weekDays[day]) {
                    className += ' disabled';
                  }

                  return (
                    <a
                      key={index}
                      className={className}
                      onClick={this.handleWeekdaySelect}
                    >{day}</a>
                  );
                })
              }
            </div>
          </div>
          <br />
          <div className="participant-list">
            <h6><strong>Participants</strong></h6>
            {event.participants.map((participant, index) => (
              <div className="participant" styleName="participant" key={index}>
                <img className="circle" styleName="participant-img" src={participant.avatar} />
                {participant.name}
              </div>
            ))}
          </div>
        </div>
        <div className="card-action" styleName="card-action">
          <a href={`/event/${event.uid}`}>View Details</a>
        </div>
      </div>
    );
  }
}

EventCard.propTypes = {
  event: React.PropTypes.object,
};

export default cssModules(EventCard, styles);
