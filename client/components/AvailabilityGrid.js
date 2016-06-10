import React from 'react';
import cssModules from 'react-css-modules';
import _ from 'lodash';
import moment from 'moment';
import autobind from 'autobind-decorator';
import fetch from 'isomorphic-fetch';
import { checkStatus } from '../util/fetch.util';
import { browserHistory } from 'react-router';
import { getHours } from "../util/time-format";

import styles from '../styles/availability-grid.css';

class AvailabilityGrid extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      availability: [],
      allTimes: [],
      allTimesRender: [],
      allDates: [],
      allDatesRender: [],
    };
  }

  componentWillMount() {
    const allDates = _.flatten(this.props.dates.map(({ fromDate, toDate }) =>
      this.getDaysBetween(fromDate, toDate)
    ));

    const allTimes = _.flatten([this.props.dates[0]].map(({ fromDate, toDate }) =>
      this.getTimesBetween(fromDate, toDate)
    ));

    const allDatesRender = allDates.map(date => moment(date).format('Do MMM'));
    const allTimesRender = allTimes.map(time => moment(time).format('hh:mm a'));

    allTimesRender.pop();

    this.setState({ allDates, allTimes, allDatesRender, allTimesRender });
  }

  componentDidMount() {
    $(".cell").on("mousedown mouseover", e => {
      this.addCellToAvail(e)
    }).on("click", e => {
      if (e.shiftKey) {
        let next = false;
        let startCell;
        const currentCell = $(e.target);
        const parentRow = $(e.target).parent();
        parentRow.children(".cell").each((i, el) => {
          if($(el).css("background-color") === "rgb(128, 0, 128)" && $(el).prev().css("background-color") !== "rgb(128, 0, 128)" && $(el).next().css("background-color") !== "rgb(128, 0, 128)"){
            startCell = $(el)
            return false;
          }
        })
        while(startCell.attr("data-time") !== currentCell.attr("data-time")) {
          $(startCell).next().css("background-color", "rgb(128, 0, 128")
          startCell = $(startCell).next();
        }
      }
    })

    $(".cell").each(function(i, el){
      if($(el).attr("data-time").split(":")[1].split(" ")[0] === "00"){
        $(this).css("border-left", "1px solid #909090")
      }
      else if($(el).attr("data-time").split(":")[1].split(" ")[0] === "30"){
        $(this).css("border-left", "1px solid #c3bebe")
      }
    })
  }

  getDaysBetween(start, end) {
    const dates = [start];
    let currentDay = start;

    while (moment(end).isAfter(dates[dates.length - 1], 'day')) {
      currentDay = moment(currentDay).add(1, 'd')._d;
      dates.push(currentDay);
    }

    return dates;
  }

  getTimesBetween(start, end) {
    const times = [start];
    let currentTime = start;

    end = moment(end).set("date", moment(start).get("date"));

    while (times[times.length - 1] < end) {
      currentTime = moment(currentTime).add(15, 'm')._d;
      times.push(currentTime);
    }

    console.log(times.length)
    return times;
  }

  @autobind
  addCellToAvail(ev) {
    if (ev.buttons == 1 || ev.buttons == 3) {
      if($(ev.target).css("background-color") !== "rgb(128, 0, 128)"){
        $(ev.target).css("background-color", "purple")
      } else {
        $(ev.target).css("background-color", "white")
      }
    }
  }

  @autobind
  async submitAvailability() {
    const { allDates, allTimes, allDatesRender, allTimesRender } = this.state;
    const availability = [];

    $(".cell").each((i, el) => {
      if($(el).css("background-color") === "rgb(128, 0, 128)"){
        const timeIndex = allTimesRender.indexOf($(el).attr('data-time'));
        const dateIndex = allDatesRender.indexOf($(el).attr('data-date'));

        const date = moment(allDates[dateIndex]).get('date');

        const from = moment(allTimes[timeIndex]).set('date', date)._d;
        const to = moment(allTimes[timeIndex + 1]).set('date', date)._d;

        availability.push([from, to]);
      }
    })
    console.log(availability)
    const response = await fetch(`/api/events/${window.location.pathname.split("/")[2]}/updateAvail`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      body: JSON.stringify({data: availability, user: this.props.user}),
      credentials: 'same-origin',
    });

    try {
      checkStatus(response);
    } catch (err) {
      console.log(err); return;
    }

    window.location.reload();
  }

  addZero(time) {
    if(Number(String(time).split(":")[0]) < 10){
      time = `0${time}`
    }
    return time;
  }

  render() {
    const { allDatesRender, allTimesRender } = this.state;
    const hourTime = allTimesRender.filter(time => String(time).split(":")[1].split(" ")[0] === "00")

    return (
      <div>
        {hourTime.map((time,i) => {
          return (
            <p styleName="grid-hour">{this.addZero(getHours(time.toUpperCase())) + ":00"}</p>
          )
        })}
        {allDatesRender.map((date, i) => (
          <div key={i} className="grid-row" styleName="row">
            <div styleName="cell-aside">
              {date}
            </div>
            {allTimesRender.map((time, i) => (
              <div
                key={i}
                styleName="cell"
                data-time={time}
                data-date={date}
                className="cell"
                onClick={this.addCellToAvail}
              ></div>
            ))}
          </div>
        ))}
        <br />
        <a
          className="waves-effect waves-light btn"
          onClick={this.submitAvailability}
        >Submit</a>
      </div>
    );
  }
}

AvailabilityGrid.propTypes = {
  dates: React.PropTypes.array.isRequired,
};

export default cssModules(AvailabilityGrid, styles);
