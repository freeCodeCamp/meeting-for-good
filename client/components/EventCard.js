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

    let fromUTC = moment(new Date()).format("Z").split(":")[0];

    //Best date/time algorithm
    let participants = this.state.participants;
    let meetArray = [];
    let bestTimes = {};
    let buildToString = {};

    //Loop over participants list, if participant has entered availability - add it to the meetArray
    for(let i = 0; i < participants.length; i++){
      if(participants[i].availibility){
        meetArray.push(participants[i].availibility);
      }
    }

    //Go over availabilities and add every available time to corresponding date array
    for(let j = 0; j < meetArray.length; j++){
      for(let k = 0; k < meetArray[j].length; k++){
        if(meetArray[j+1] !== undefined && meetArray[j+1][k]){
          if(meetArray[j][k].date === meetArray[j+1][k].date){
            for(let l = 0; l < meetArray[j+1][k].hours.length; l++){
              meetArray[j][k].hours.push(meetArray[j+1][k].hours[l]);
            }
          }
        }
      }
    }

    meetArray = meetArray.shift(); //Only first object is needed.
    // console.log(meetArray)

    let length = meetArray.length;
    for(let i = 0; i < length; i++){
      let pos = meetArray.length;
      for(let j = 0; j < meetArray[i].hours.length; j++){
        meetArray[i].hours[j] = Number(meetArray[i].hours[j]) + Number(fromUTC);
        if(meetArray[i].hours[j] > 23){
          if(meetArray[pos] === undefined){
            meetArray[pos] = {};
            meetArray[pos].date = "";
            meetArray[pos].date = moment(meetArray[i].date).add(1, "days").format("DD MMM");
            meetArray[pos].hours = [];
            meetArray[pos].hours.push(meetArray[i].hours[j] - 24);
            meetArray[i].hours.splice(j,1);
          } else {
            meetArray[pos].hours.push(meetArray[i].hours[j] - 24);
            meetArray[i].hours.splice(j,1);
          }
          j = j - 1;
        }
        if(meetArray[i].hours[j] < 0){
          if(meetArray[pos] === undefined){
            meetArray[pos] = {};
            meetArray[pos].date = "";
            meetArray[pos].date = moment(meetArray[i].date).subtract(1, "days").format("DD MMM");
            meetArray[pos].hours = [];
            meetArray[pos].hours.push(24 + meetArray[i].hours[j]);
            meetArray[i].hours.splice(j,1);
          } else {
            meetArray[pos].hours.push(24 + meetArray[i].hours[j]);
            meetArray[i].hours.splice(j,1);
          }
          j = j - 1;
        }
      }
    }

    meetArray.sort((a,b) => {
      return a.date > b.date ? 1 : b.date > a.date ? -1 : 0;
    });

    for(let i = 0; i < meetArray.length; i++){
      if(meetArray[i+1] !== undefined){
        if(meetArray[i].date === meetArray[i+1].date){
          for(let j in meetArray[i+1].hours){
            meetArray[i].hours.push(meetArray[i+1].hours[j])
          }
          meetArray.splice(i+1,1);
        }
      }
    }

    console.log(meetArray)

    if(meetArray !== undefined){
      for(let i = 0; i < meetArray.length; i++){
        if(meetArray[i].hours.length !== 0){
          let temp = meetArray[i].hours.sort((a,b) => {
            return a > b ? 1 : b > a ? -1 : 0;
          });
          for(let z = 0; z < temp.length; z++){
            if(temp[z] === temp[z+1]){
              if(bestTimes[meetArray[i].date] !== undefined){
                bestTimes[meetArray[i].date].push(temp[z]);
              } else {
                bestTimes[meetArray[i].date] = [];
                bestTimes[meetArray[i].date].push(temp[z]);
              }
            }
          }
        }
      }
    }

    console.log(bestTimes)

    Object.keys(bestTimes).map(date => {
      let previousIndex = 0;
      buildToString[date] = [];
      for(let i = 0; i < bestTimes[date].length; i++){
        if(Number(bestTimes[date][i]) + 1 !== Number(bestTimes[date][i+1])){
          bestTimes[date][i] !== bestTimes[date][previousIndex] ?
            buildToString[date].push(this.convertTime(Number(bestTimes[date][previousIndex])) + " to " + this.convertTime(Number(bestTimes[date][i]))) :
            buildToString[date].push(this.convertTime(Number(bestTimes[date][i])));
          console.log(buildToString[date]);
          previousIndex = i+1;
        }
      }
    })

    for(let i in buildToString){
      if(buildToString[i].length === 0){
        delete buildToString[i];
      }
    }

    this.setState({bestTimes: buildToString})

    setTimeout(() => {
      $(".alt").each((i,el) => {
        $(el).parents(".card").find("#best").remove();
      })
    }, 100)
  }

  convertTime(num){
    let result;
    if(num < 10){
      result = "0" + num + ":00";
    } else {
      result = num + ":00";
    }
    return result;
  }

  render() {
    const modifiers = {
      selected: day =>
        DateUtils.isDayInRange(day, this.state) ||
        this.state.ranges.some(v => DateUtils.isDayInRange(day, v)),
    };

    const { event } = this.props;
    const { bestTimes } = this.state;
    const isBestTime = bestTimes !== undefined ? Object.keys(bestTimes).length > 0 ? true : false : false;

    return (
      <div className="card" styleName="event">
        <div className="card-content">
          <span className="card-title">{event.name}</span>
          <h6 id="best"><strong>Best dates & times</strong></h6>
          <div className="row">
            <div className="col s12">
                {isBestTime ?
                Object.keys(bestTimes).map(date => {
                  return (
                    <div>
                      <p><i className="material-icons" styleName="material-icons">date_range</i>{date}</p>
                      <p><i className="material-icons" styleName="material-icons">alarm</i>{bestTimes[date].join(", ")}</p>
                      <hr />
                    </div>
                  )
                }) : event.dates ?
                <DayPicker
                  className="alt"
                  styleName="day-picker"
                  fromMonth={new Date()}
                  modifiers = { modifiers }
                /> :
                Object.keys(event.weekDays).map((day, index) => {
                  let className = 'btn-flat alt';
                  if (!event.weekDays[day]) {
                    className += ' disabled';
                  }

                  return (
                    <a
                      id="alt"
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
