import React from 'react';
import cssModules from 'react-css-modules';
import _ from 'lodash';
import moment from 'moment';
import autobind from 'autobind-decorator';
import fetch from 'isomorphic-fetch';
import { checkStatus } from '../util/fetch.util';
import { browserHistory } from 'react-router';
import { getHours } from "../util/time-format";
import colorsys from 'colorsys';

import styles from '../styles/availability-grid.css';

class AvailabilityGrid extends React.Component {
  constructor(props) {
    super(props);

    let dateFormatStr = 'Do MMM';

    if (props.weekDays) dateFormatStr = 'ddd';

    this.state = {
      availability: [],
      allTimes: [],
      allTimesRender: [],
      allDates: [],
      allDatesRender: [],
      dateFormatStr,
    };
  }

  componentWillMount() {
    const allDates = _.flatten(this.props.dates.map(({ fromDate, toDate }) =>
      this.getDaysBetween(fromDate, toDate)
    ));

    const allTimes = _.flatten([this.props.dates[0]].map(({ fromDate, toDate }) =>
      this.getTimesBetween(fromDate, toDate)
    ));

    const allDatesRender = allDates.map(date => moment(date).format(this.state.dateFormatStr));
    const allTimesRender = allTimes.map(time => moment(time).format('hh:mm a'));

    allTimesRender.pop();

    this.setState({ allDates, allTimes, allDatesRender, allTimesRender });
  }

  componentDidMount() {
    if (this.props.heatmap) this.renderHeatmap();
    if (this.props.myAvailability && this.props.myAvailability.length > 0) this.renderAvail();

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

    if (moment(end).hour() < moment(start).hour()) {
      while (moment(end).hour() < moment(times[times.length - 1]).hour()) {
        currentTime = moment(currentTime).add(15, 'm')._d;
        times.push(currentTime);
        if (moment(currentTime).hour() === 0) break;
      }

      while (moment(end).hour() > moment(times[times.length - 1]).hour()) {
        currentTime = moment(currentTime).add(15, 'm')._d;
        times.push(currentTime);
      }
    } else {
      end = moment(end).set('date', moment(start).get('date'));

      while (moment(end).hour() > moment(times[times.length - 1]).hour()) {
        currentTime = moment(currentTime).add(15, 'm')._d;
        times.push(currentTime);
      }
    }

    return times;
  }

  @autobind
  addCellToAvail(ev) {
    if (this.props.heatmap || ev.target.className.includes('disabled')) return;

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

    this.props.submitAvail(availability);
  }

  @autobind
  editAvailability() {
    this.props.editAvail();
  }

  addZero(time) {
    if(Number(String(time).split(":")[0]) < 10){
      time = `0${time}`
    }
    return time;
  }

  renderHeatmap() {
    const availabilityLength = this.props.availability.filter(av => av).length;
    const saturationDivisions = 100 / availabilityLength;
    const saturations = [];

    for (let i = 0; i <= 100; i += saturationDivisions) {
      saturations.push(i);
    }

    const colors = saturations.map(saturation => colorsys.hsvToHex({
      h: 271,
      s: saturation,
      v: 100,
    }));

    const formatStr = 'Do MMMM YYYY hh:mm a';
    const { allTimesRender, allDatesRender, allDates, allTimes } = this.state;
    const availabilityNum = {};
    const cells = document.querySelectorAll('.cell');

    let flattenedAvailability = _.flatten(this.props.availability);

    flattenedAvailability = flattenedAvailability.filter(avail => avail).map(avail =>
      new Date(avail[0])
    ).map(avail =>
      moment(avail).format(formatStr)
    );

    flattenedAvailability.forEach(avail => {
      if (availabilityNum[avail]) availabilityNum[avail] += 1;
      else availabilityNum[avail] = 1;
    });

    for (const cell of cells) {
      const timeIndex = allTimesRender.indexOf(cell.getAttribute('data-time'));
      const dateIndex = allDatesRender.indexOf(cell.getAttribute('data-date'));

      const date = moment(allDates[dateIndex]).get('date');
      const cellFormatted = moment(allTimes[timeIndex]).set('date', date).format(formatStr);

      cell.style.background = colors[availabilityNum[cellFormatted]];
    }
  }

  renderAvail() {
    const cells = document.querySelectorAll('.cell');
    const { allTimesRender, allDatesRender, allDates, allTimes } = this.state;
    const formatStr = 'Do MMMM YYYY hh:mm a';
    const myAvailabilityFrom = this.props.myAvailability
                                    .map(avail => new Date(avail[0]))
                                    .map(avail => moment(avail).format(formatStr));


    for (const cell of cells) {
      const timeIndex = allTimesRender.indexOf(cell.getAttribute('data-time'));
      const dateIndex = allDatesRender.indexOf(cell.getAttribute('data-date'));

      const date = moment(allDates[dateIndex]).get('date');
      const cellFormatted = moment(allTimes[timeIndex]).set('date', date).format(formatStr);

      if (myAvailabilityFrom.indexOf(cellFormatted) > -1) {
        cell.style.background = 'purple';
      }
    }
  }

  render() {
    const { allDatesRender, allTimesRender } = this.state;
    const { dates } = this.props;
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
            {allTimesRender.map((time, i) => {
              let disabled = '';
              let styleName = 'cell';

              dates.forEach(({ fromDate, toDate }) => {
                const fromDateFormatted = moment(fromDate).format('hh:mm a');
                const toDateFormatted = moment(toDate).format('hh:mm a');

                if (moment(fromDate).format(this.state.dateFormatStr) === date &&
                    moment(fromDateFormatted, 'hh:mm a').isAfter(moment(time, 'hh:mm a')) ||
                    moment(toDate).format(this.state.dateFormatStr) === date &&
                    moment(toDateFormatted, 'hh:mm a').isBefore(moment(time, 'hh:mm a'))) {
                  disabled = 'disabled';
                  styleName = 'disabled';
                }
              });

              return (
                <div
                  key={i}
                  styleName={`${styleName}`}
                  data-time={time}
                  data-date={date}
                  className={`cell ${disabled}`}
                  onClick={this.addCellToAvail}
                ></div>
              );
            })}
          </div>
        ))}
        <br />
        <div className="center">
          {this.props.heatmap ?
            <a
              className="waves-effect waves-light btn"
              onClick={this.editAvailability}
            >Edit Availability</a> :
            <a
              className="waves-effect waves-light btn"
              onClick={this.submitAvailability}
            >Submit</a>
          }
        </div>
      </div>
    );
  }
}

AvailabilityGrid.propTypes = {
  dates: React.PropTypes.array.isRequired,
  heatmap: React.PropTypes.bool,
  weekDays: React.PropTypes.bool,
  user: React.PropTypes.object,
  availability: React.PropTypes.array,
  submitAvail: React.PropTypes.func,
  editAvail: React.PropTypes.func,
  myAvailability: React.PropTypes.array,
};

export default cssModules(AvailabilityGrid, styles);
