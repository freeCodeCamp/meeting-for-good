import React from 'react';
import DayPicker, { DateUtils } from 'react-day-picker';
import cssModules from 'react-css-modules';
import moment from 'moment';

import styles from '../styles/event-card.css';
import 'react-day-picker/lib/style.css';

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

    this.state = {
      ranges: props.event.dates,
    };
  }

  findDaysBetweenDates(date1, date2){
    const ONE_DAY = 1000 * 60 * 60 * 24

    const date1_ms = date1.getTime()
    const date2_ms = date2.getTime()

    const difference_ms = Math.abs(date1_ms - date2_ms)

    return Math.round(difference_ms/ONE_DAY) + 1;
  }

  componentDidMount(){
    const self = this;
    const ranges = this.state.ranges
    let dateRange = {};
    if(ranges.length > 1){
        dateRange.from = ranges[0].from;
        dateRange.to = ranges[ranges.length-1].to;
    } else {
        dateRange.from = ranges[0].from;
        dateRange.to = ranges[0].to;
    }
    const cal = new CalHeatMap();
	cal.init({
        domain: "day",
        subdomain: "hour",
        start: dateRange.from,
        range: self.findDaysBetweenDates(dateRange.from, dateRange.to),
        rowLimit: 1,
	    domainGutter: 0,
        verticalOrientation: true,
        cellSize: 20,
    	subDomainTextFormat: "%H",
        label: {
    		position: "left",
    		offset: {
    			x: 20,
    			y: 15
    		}
    	},
    	displayLegend: false
    });
    for(let i in ranges){
        for(let j in ranges[i]){
            console.log(ranges[i][j])
            $(".graph-label").each((index,el) => {
                if(String(ranges[i][j]).indexOf("0" + el.textContent.split(" ")[0]) > -1){
                    console.log(el.textContent)
                }
            })
        }
    }
    $(".graph-label, .subdomain-text").css({
        "-webkit-user-select": "none",
        "-moz-user-select": "none",
        "-ms-user-select": "none",
        "user-select": "none"
    })
    $("rect").on("mousedown mouseover", function (e) {
        if (e.buttons == 1 || e.buttons == 3) {
            if($(this).css("fill") !== "rgb(128, 0, 128)"){
                $(this).css("fill", "purple");
                $(this).parent().find("text").css("fill", "white")
            } else {
                $(this).css("fill", "#ededed");
                $(this).parent().find("text").css("fill", "#999")
            }
        }
    })
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
          <div id="cal-heatmap"></div>
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
  meeting: React.PropTypes.object,
};

export default cssModules(MeetingEvent, styles);
