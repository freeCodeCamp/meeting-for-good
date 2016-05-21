import React from 'react';
import DayPicker, { DateUtils } from 'react-day-picker';
import cssModules from 'react-css-modules';
import moment from 'moment';
import 'd3';
import CalHeatMap from 'cal-heatmap/cal-heatmap.min.js';

import styles from '../styles/event-card.css';
import 'react-day-picker/lib/style.css';
import 'cal-heatmap/cal-heatmap.css';

class MeetingEvent extends React.Component {
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

    let fromUTC = moment(new Date()).format("Z").split(":")[0];
    //Convert times back to client time
    let timeRange = props.event.selectedTimeRange.map(time => {
      time = Number(time) + Number(fromUTC);
      return time;
    })

    console.log(timeRange)

    if(timeRange[0] < 0 && timeRange[1] < 0){
      console.log("<0");
      timeRange[0] = 24 + timeRange[0];
      timeRange[1] = 24 + timeRange[1];
      props.event.dates.forEach(obj => {
        Object.keys(obj).map(date => {
          obj[date] = new Date(moment(new Date(obj[date])).subtract(1,'days'));
          return date;
        })
      })
    }

    if(timeRange[0] < 0 && timeRange[1] > 0){
      props.event.dates.forEach(obj => {
        props.event.dates.forEach(obj => {
          obj["from"] = new Date(moment(new Date(obj["from"])).subtract(1,'days'));
        })
      })
    }

    if(timeRange[0] > 23 && timeRange[1] > 23){
      console.log(">23");
      timeRange[0] = timeRange[0] - 24;
      timeRange[1] = timeRange[1] - 24;
      props.event.dates.forEach(obj => {
        Object.keys(obj).map(date => {
          obj[date] = new Date(moment(new Date(obj[date])).add(1,'days'));
          return date;
        })
      })
    }

    if(timeRange[0] < 23 && timeRange[1] > 23){
      props.event.dates.forEach(obj => {
        obj["to"] = new Date(moment(new Date(obj["to"])).add(1,'days'));
      })
    }

    console.log(props.event.dates);
    console.log(timeRange)

    this.state = {
      event: props.event,
      ranges: props.event.dates,
      days: props.event.weekDays,
      timeRange
    };
  }

  componentDidMount(){
    $.get("/api/auth/current", user => {
      this.setState({user})
    })
  }

  showCalHeatmap() {
    $("#cal-heatmap").removeClass("hide");
    $("#heatmap a").toggleClass("hide");
    const self = this;
    const ranges = this.state.ranges;
    const days = this.state.days;
    let startDate;
    let cal = new CalHeatMap();
    if(ranges !== undefined){
      if (ranges.length > 1) {
        for(let r = 0; r < ranges.length; r++){
          startDate = ranges[r].from
          console.log(startDate);
          console.log(ranges[r].from, ranges[r].to)
          cal.init({
            domain: 'day',
            subdomain: 'hour',
            start: startDate,
            range: self.findDaysBetweenDates(ranges[r].from, ranges[r].to),
            rowLimit: 1,
            domainGutter: 0,
            verticalOrientation: true,
            cellSize: 20,
            subDomainTextFormat: '%H',
            label: {
              position: 'left',
              offset: {
                x: 20,
                y: 15,
              },
            },
            displayLegend: false,
          });
        }
        $("svg.cal-heatmap-container").not(":last").remove()
        $(".graph-domain").each((i,el) => {
          $(el).attr("y", i*22);
        })
        const heatmapHeight = Number($(".graph-domain").last().attr("y")) + 25;
        $("#cal-heatmap").css("height", heatmapHeight + "px")
      } else {
        startDate = ranges[0].from
        cal.init({
          domain: 'day',
          subdomain: 'hour',
          start: startDate,
          range: self.findDaysBetweenDates(ranges[0].from, ranges[0].to),
          rowLimit: 1,
          domainGutter: 0,
          verticalOrientation: true,
          cellSize: 20,
          subDomainTextFormat: '%H',
          label: {
            position: 'left',
            offset: {
              x: 20,
              y: 15,
            },
          },
          displayLegend: false,
        });
        $(".cal-heatmap-container").css("height", Number($(".graph-domain").last().attr("y")) + 25 + "px")
      }
    }

    console.log(days)
    if(days !== undefined){
      for(let r = 0; r < 7; r++){
        const daysOfWeek = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
        let currentDay;
        console.log(days[Object.keys(days)[r]])
        if(days[Object.keys(days)[r]]){
          console.log(r);
          let temp = Object.keys(days)[r];
          console.log(temp)
          currentDay = new Date(1970,5, daysOfWeek.indexOf(temp) + 1);
          console.log(currentDay);
          cal.init({
            domain: 'day',
            subdomain: 'hour',
            start: currentDay,
            range: 1,
            rowLimit: 1,
            domainGutter: 0,
            verticalOrientation: true,
            cellSize: 20,
            subDomainTextFormat: '%H',
            label: {
              position: 'left',
              offset: {
                x: 20,
                y: 15,
              },
            },
            displayLegend: false,
            domainLabelFormat: "%w"
          });
        }
      }
      $("svg.cal-heatmap-container").not(":last").remove()
      $(".graph-domain").each((i,el) => {
        $(el).attr("y", i*22);
      })
      const heatmapHeight = Number($(".graph-domain").last().attr("y")) + 25;
      $("#cal-heatmap").css("height", heatmapHeight + "px")
      $(".graph-label").each((i, el) => {
        switch($(el).text()){
          case "1":
            $(el).text("Monday")
            break;
          case "2":
            $(el).text("Tuesday")
            break;
          case "3":
            $(el).text("Wednesday")
            break;
          case "4":
            $(el).text("Thursday")
            break;
          case "5":
            $(el).text("Friday")
            break;
          case "6":
            $(el).text("Saturday")
            break;
          case "0":
            $(el).text("Sunday")
            break;
        }
      })
    }

    if(this.state.timeRange.length !== 0){
      let timeRangeFrom = Number(this.state.timeRange[0]);
      let timeRangeTo = Number(this.state.timeRange[1]);
      if(timeRangeFrom >= 0){
        $(".subdomain-text").each((index,el) => {
          for(let i = timeRangeFrom; i <= timeRangeTo; i++){
            let j = i;
            if(j > 23){
              j = j - 24;
            }
            if(j < 10){
              if($(el).text() === ("0"+j)){
                $(el).parent().addClass("time-range");
              }
            } else {
              if($(el).text() === String(j)){
                $(el).parent().addClass("time-range");
              }
            }
          }
        });
        $("g").not(".time-range").remove();
      }
      if(timeRangeTo > 23){
        $(".graph-domain").first().find(".subdomain-text").each((index,el) => {
          if(Number($(el).text()) <= timeRangeTo - 24){
            $(el).parent().remove();
          }
        })
        $(".graph-domain").last().find(".subdomain-text").each((index,el) => {
          if(Number($(el).text()) > timeRangeTo - 24){
            $(el).parent().remove();
          }
        })
      }
      if(timeRangeFrom < 0){
        $(".graph-domain").first().find(".subdomain-text").each((index,el) => {
          if(Number($(el).text()) < 24 + timeRangeFrom){
            $(el).parent().remove();
          }
        })
        $(".graph-domain").last().find(".subdomain-text").each((index,el) => {
          if(Number($(el).text()) >= 24 + timeRangeFrom){
            $(el).parent().remove();
          }
        })
      }
      $(".graph-subdomain-group").each((index,element) => {
        $(element).find("g").each((i,el) => {
          $(el).children("rect").attr("x",i*22);
          $(el).children("text").attr("x", Number($(el).children("rect").attr("x")) + 10)
        })
      })
    }

    $('.graph-label, .subdomain-text').css({
      '-webkit-user-select': 'none',
      '-moz-user-select': 'none',
      '-ms-user-select': 'none',
      'user-select': 'none',
    });

    $('rect').on('mousedown mouseover', function mousedownHandler(e) {
      if (e.buttons === 1 || e.buttons === 3) {
        if ($(this).css('fill') !== 'rgb(128, 0, 128)') {
          $(this).css('fill', 'purple');
          $(this).parent().find('text').css('fill', 'white');
        } else {
          $(this).css('fill', '#ededed');
          $(this).parent().find('text').css('fill', '#999');
        }
      }
    });
  }

  submitAvailability(){
    let available = []
    $(".graph-label").each((index,element) => {
      available.push({
        date: $(element).text(),
        hours: []
      })
    })
    $("rect").each((i,el) => {
      if($(el).css("fill") === 'rgb(128, 0, 128)'){
        let date = $(el).parents(".graph-subdomain-group").siblings(".graph-label").text();
        let hour = $(el).siblings("text").text();
        available.map(obj => {
          if(obj.date === date && obj.hours.indexOf(hour) === -1){
            obj.hours.push(hour);
          }
          return obj;
        })
      }
    })
    console.log(available, this.state.event.uid, this.state.user);
    let fromUTC = moment(new Date()).format("Z").split(":")[0];

    let length = available.length;
    let found = false;
    for(let i = 0; i < length; i++){
      let pos = available.length;
      for(let j = 0; j < available[i].hours.length; j++){
        available[i].hours[j] = Number(available[i].hours[j]) - Number(fromUTC);
        if(available[i].hours[j] > 23){
          if(available[pos] === undefined){
            available[pos] = {};
            available[pos].date = "";
            available[pos].date = moment(available[i].date).add(1, "days").format("DD MMM");
            available[pos].hours = [];
            available[pos].hours.push(available[i].hours[j] - 24);
            available[i].hours.splice(j,1);
          } else {
            available[pos].hours.push(available[i].hours[j] - 24);
            available[i].hours.splice(j,1);
          }
          j = j - 1;
        }
        if(available[i].hours[j] < 0){
          if(available[pos] === undefined){
            available[pos] = {};
            available[pos].date = "";
            available[pos].date = moment(available[i].date).subtract(1, "days").format("DD MMM");
            available[pos].hours = [];
            available[pos].hours.push(24 + available[i].hours[j]);
            available[i].hours.splice(j,1);
          } else {
            available[pos].hours.push(24 + available[i].hours[j]);
            available[i].hours.splice(j,1);
          }
          j = j - 1;
        }
      }
    }

    available.sort((a,b) => {
      return a.date > b.date ? 1 : b.date > a.date ? -1 : 0;
    });

    for(let i = 0; i < available.length; i++){
      if(available[i+1] !== undefined){
        if(available[i].date === available[i+1].date){
          for(let j in available[i+1].hours){
            available[i].hours.push(available[i+1].hours[j])
          }
          available.splice(i+1,1);
        }
      }
    }

    if(this.state.user !== undefined){
      $.ajax({
        type: 'POST',
        url: '/api/events',
        data: JSON.stringify({user: this.state.user, data: available, id: this.state.event.uid}),
        contentType: 'application/json',
        dataType: 'json',
        success: () => {},
        error: () => Materialize.toast('An error occured. Please try again later.', 4000),
      });
      // window.location.reload()
    }
  }

  findDaysBetweenDates(date1, date2) {
    const ONE_DAY = 1000 * 60 * 60 * 24;
    const date1Ms = date1.getTime();
    const date2Ms = date2.getTime();
    const differenceMs = Math.abs(date1Ms - date2Ms);
    return Math.round(differenceMs / ONE_DAY) + 1;
  }

  render() {
    const modifiers = {
      selected: day =>
        DateUtils.isDayInRange(day, this.state) ||
        this.state.ranges.some(v => DateUtils.isDayInRange(day, v)),
    };

    const { event } = this.props;

    return (
      <div className="card meeting" styleName="event-details">
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
                      style={{cursor: "default"}}
                    >{day}</a>
                  );
                })
              }
            </div>
          </div>
          <div id="heatmap" className="center">
            <div id="cal-heatmap" className="hide"></div>
            <a className="waves-effect waves-light btn" onClick={this.showCalHeatmap.bind(this)}>Enter my availability</a>
            <a className="waves-effect waves-light btn hide" onClick={this.submitAvailability.bind(this)}>Submit</a>
          </div>
          <br />
          <div>
            <h6><strong>Participants</strong></h6>
            {event.participants.map((participant, index) => (
              <div className="participant" styleName="participant" key={index}>
                <img className="circle" styleName="participant-img" src={participant.avatar} />
                {participant.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

MeetingEvent.propTypes = {
  event: React.PropTypes.object,
};

export default cssModules(MeetingEvent, styles);
