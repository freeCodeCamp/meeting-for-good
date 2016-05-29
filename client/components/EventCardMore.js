import React from 'react';
import update from 'react-addons-update';
import autobind from 'autobind-decorator';
import DayPicker, { DateUtils } from 'react-day-picker';
import cssModules from 'react-css-modules';
import moment from 'moment';
import 'd3';
import CalHeatMap from 'cal-heatmap/cal-heatmap.min.js';
import fetch from 'isomorphic-fetch';

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

    const fromUTC = moment(new Date()).format('Z').split(':')[0];
    // Convert times back to client time
    const timeRange = props.event.selectedTimeRange.map(time => {
      time = Number(time) + Number(fromUTC);
      return time;
    });

    console.log(timeRange);

    if (timeRange[0] < 0 && timeRange[1] < 0) {
      console.log('<0');
      timeRange[0] = 24 + timeRange[0];
      timeRange[1] = 24 + timeRange[1];
      props.event.dates.forEach(obj => {
        Object.keys(obj).map(date => {
          obj[date] = new Date(moment(new Date(obj[date])).subtract(1, 'days'));
          return date;
        });
      });
    }

    if (timeRange[0] < 0 && timeRange[1] > 0) {
      props.event.dates.forEach(() => {
        props.event.dates.forEach(obj => {
          obj.from = new Date(moment(new Date(obj.from)).subtract(1, 'days'));
        });
      });
    }

    if (timeRange[0] > 23 && timeRange[1] > 23) {
      console.log('>23');
      timeRange[0] = timeRange[0] - 24;
      timeRange[1] = timeRange[1] - 24;
      props.event.dates.forEach(obj => {
        Object.keys(obj).map(date => {
          obj[date] = new Date(moment(new Date(obj[date])).add(1, 'days'));
          return date;
        });
      });
    }

    if (timeRange[0] < 23 && timeRange[1] > 23) {
      props.event.dates.forEach(obj => {
        obj.to = new Date(moment(new Date(obj.to)).add(1, 'days'));
      });
    }

    console.log(props.event.dates);
    console.log(timeRange);

    const eventParticipantsIds = props.event.participants.map(participant => participant._id);

    this.state = {
      event: props.event,
      ranges: props.event.dates,
      days: props.event.weekDays,
      timeRange,
      user: {},
      eventParticipantsIds,
    };
  }

  componentDidMount() {
    $.get('/api/auth/current', user => {
      if (user !== '') {
        this.setState({ user });
      }
    });
  }

  @autobind
  showCalHeatmap() {
    $('#cal-heatmap').removeClass('hide');
    $('#heatmap a').toggleClass('hide');
    const self = this;
    const ranges = this.state.ranges;
    const days = this.state.days;
    let startDate;
    const cal = new CalHeatMap();
    if (ranges !== undefined) {
      if (ranges.length > 1) {
        for (let r = 0; r < ranges.length; r++) {
          startDate = ranges[r].from;
          console.log(startDate);
          console.log(ranges[r].from, ranges[r].to);
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
        $('svg.cal-heatmap-container').not(':last').remove();
        $('.graph-domain').each((i, el) => {
          $(el).attr('y', i * 22);
        });
        const heatmapHeight = Number($('.graph-domain').last().attr('y')) + 25;
        $('#cal-heatmap').css('height', `${heatmapHeight}px`);
      } else {
        startDate = ranges[0].from;
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
        $('.cal-heatmap-container').css('height',
          Number($('.graph-domain').last().attr('y')) + 25 + 'px');
      }
    }

    console.log(days);
    if (days !== undefined) {
      for (let r = 0; r < 7; r++) {
        const daysOfWeek = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
        let currentDay;
        console.log(days[Object.keys(days)[r]]);
        if (days[Object.keys(days)[r]]) {
          console.log(r);
          const temp = Object.keys(days)[r];
          console.log(temp);
          currentDay = new Date(1970, 5, daysOfWeek.indexOf(temp) + 1);
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
            domainLabelFormat: '%w',
          });
        }
      }
      $('svg.cal-heatmap-container').not(':last').remove();
      $('.graph-domain').each((i, el) => {
        $(el).attr('y', i * 22);
      });
      const heatmapHeight = Number($('.graph-domain').last().attr('y')) + 25;
      $('#cal-heatmap').css('height', `${heatmapHeight}px`);
      $('.graph-label').each((i, el) => {
        switch ($(el).text()) {
          case '1':
            $(el).text('Monday');
            break;
          case '2':
            $(el).text('Tuesday');
            break;
          case '3':
            $(el).text('Wednesday');
            break;
          case '4':
            $(el).text('Thursday');
            break;
          case '5':
            $(el).text('Friday');
            break;
          case '6':
            $(el).text('Saturday');
            break;
          case '0':
            $(el).text('Sunday');
            break;
        }
      });
    }

    if (this.state.timeRange.length !== 0) {
      const timeRangeFrom = Number(this.state.timeRange[0]);
      const timeRangeTo = Number(this.state.timeRange[1]);
      if (timeRangeFrom >= 0) {
        $('.subdomain-text').each((index, el) => {
          for (let i = timeRangeFrom; i <= timeRangeTo; i++) {
            let j = i;
            if (j > 23) {
              j = j - 24;
            }
            if (j < 10) {
              if ($(el).text() === (`0${j}`)) {
                $(el).parent().addClass('time-range');
              }
            } else {
              if ($(el).text() === String(j)) {
                $(el).parent().addClass('time-range');
              }
            }
          }
        });
        $('g').not('.time-range').remove();
      }
      if (timeRangeTo > 23) {
        $('.graph-domain').first().find('.subdomain-text').each((index, el) => {
          if (Number($(el).text()) <= timeRangeTo - 24) {
            $(el).parent().remove();
          }
        });
        $('.graph-domain').last().find('.subdomain-text').each((index, el) => {
          if (Number($(el).text()) > timeRangeTo - 24) {
            $(el).parent().remove();
          }
        });
      }
      if (timeRangeFrom < 0) {
        $('.graph-domain').first().find('.subdomain-text').each((index, el) => {
          if (Number($(el).text()) < 24 + timeRangeFrom) {
            $(el).parent().remove();
          }
        });
        $('.graph-domain').last().find('.subdomain-text').each((index, el) => {
          if (Number($(el).text()) >= 24 + timeRangeFrom) {
            $(el).parent().remove();
          }
        });
      }
      $('.graph-subdomain-group').each((index, element) => {
        $(element).find('g').each((i, el) => {
          $(el).children('rect').attr('x', i * 22);
          $(el).children('text').attr('x', Number($(el).children('rect').attr('x')) + 10);
        });
      });
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

  @autobind
  submitAvailability() {
    const available = [];
    $('.graph-label').each((index, element) => {
      available.push({
        date: $(element).text(),
        hours: [],
      });
    });
    $('rect').each((i, el) => {
      if ($(el).css('fill') === 'rgb(128, 0, 128)') {
        const date = $(el).parents('.graph-subdomain-group').siblings('.graph-label').text();
        const hour = $(el).siblings('text').text();
        available.map(obj => {
          if (obj.date === date && obj.hours.indexOf(hour) === -1) {
            obj.hours.push(hour);
          }
          return obj;
        });
      }
    });
    console.log(available, this.state.event.uid, this.state.user);
    const fromUTC = moment(new Date()).format('Z').split(':')[0];

    const length = available.length;
    for (let i = 0; i < length; i++) {
      const pos = available.length;
      for (let j = 0; j < available[i].hours.length; j++) {
        available[i].hours[j] = Number(available[i].hours[j]) - Number(fromUTC);
        if (available[i].hours[j] > 23) {
          if (available[pos] === undefined) {
            available[pos] = {};
            available[pos].date = '';
            available[pos].date = moment(available[i].date).add(1, 'days').format('DD MMM');
            available[pos].hours = [];
            available[pos].hours.push(available[i].hours[j] - 24);
            available[i].hours.splice(j, 1);
          } else {
            available[pos].hours.push(available[i].hours[j] - 24);
            available[i].hours.splice(j, 1);
          }
          j = j - 1;
        }
        if (available[i].hours[j] < 0) {
          if (available[pos] === undefined) {
            available[pos] = {};
            available[pos].date = '';
            available[pos].date = moment(available[i].date).subtract(1, 'days').format('DD MMM');
            available[pos].hours = [];
            available[pos].hours.push(24 + available[i].hours[j]);
            available[i].hours.splice(j, 1);
          } else {
            available[pos].hours.push(24 + available[i].hours[j]);
            available[i].hours.splice(j, 1);
          }
          j = j - 1;
        }
      }
    }

    available.sort((a, b) =>
      a.date > b.date ? 1 : b.date > a.date ? -1 : 0
    );

    for (let i = 0; i < available.length; i++) {
      if (available[i + 1] !== undefined) {
        if (available[i].date === available[i + 1].date) {
          for (let j in available[i + 1].hours) {
            available[i].hours.push(available[i + 1].hours[j]);
          }
          available.splice(i + 1, 1);
        }
      }
    }

    if (this.state.user !== undefined) {
      $.ajax({
        type: 'PUT',
        url: `/api/events/${this.state.event._id}/updateAvail`,
        data: JSON.stringify({ user: this.state.user, data: available, id: this.state.event.uid }),
        contentType: 'application/json',
        dataType: 'json',
        success: () => { window.location.reload(); },
        error: () => Materialize.toast('An error occured. Please try again later.', 4000),
      });
    }
  }

  findDaysBetweenDates(date1, date2) {
    const ONE_DAY = 1000 * 60 * 60 * 24;
    const date1Ms = date1.getTime();
    const date2Ms = date2.getTime();
    const differenceMs = Math.abs(date1Ms - date2Ms);
    return Math.round(differenceMs / ONE_DAY) + 1;
  }

  @autobind
  joinEvent() {
    let name;
    let avatar;

    if (this.state.user.local) {
      name = this.state.user.local.username;
      avatar = this.state.user.local.avatar;
    } else if (this.state.user.github) {
      name = this.state.user.github.username;
      avatar = this.state.user.github.avatar;
    } else if (this.state.user.facebook) {
      name = this.state.user.facebook.username;
      avatar = this.state.user.facebook.avatar;
    }

    const participant = {
      name,
      avatar,
      _id: this.state.user._id,
    };

    const event = update(this.state.event, {
      participants: { $push: [participant] },
    });

    const eventParticipantsIds = update(this.state.eventParticipantsIds, {
      $push: [this.state.user._id],
    });

    const sentData = JSON.stringify(event);

    fetch(`/api/events/${event._id}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      body: sentData,
    })
    .then(() => this.setState({ event, eventParticipantsIds }))
    .catch(() => { Materialize.toast('An error occured. Please try again later.', 4000); });
  }

  @autobind
  deleteEvent() {
    $.ajax({
      url: `/api/events/${this.state.event._id}`,
      type: 'DELETE',
      error: () => Materialize.toast('An error occured. Please try again later.', 4000),
      success: () => { window.location.href = '/'; },
    });
  }

  render() {
    const modifiers = {
      selected: day =>
        DateUtils.isDayInRange(day, this.state) ||
        this.state.ranges.some(v => DateUtils.isDayInRange(day, v)),
    };

    // const { event } = this.props;
    const { event, user } = this.state;
    let isOwner;

    if (user !== undefined) {
      if (user.github) isOwner = event.owner === user.github.username;
      else if (user.facebook) isOwner = event.owner === user.facebook.username;
      else if (user.local) isOwner = event.owner === user.local.username;
    }

    return (
      <div className="card meeting" styleName="event-details">
      {
        isOwner ?
          <a
            className="btn-floating btn-large waves-effect waves-light red"
            styleName="delete-event"
            onClick={this.deleteEvent}
          ><i className="material-icons">delete</i></a>
          : ''
      }
        <div className="card-content">
          <span className="card-title">{event.name}</span>
          <div className="row">
            <div className="col s12">
              {event.dates ?
                <DayPicker
                  fromMonth={new Date()}
                  modifiers={modifiers}
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
                      style={{ cursor: 'default' }}
                    >{day}</a>
                  );
                })
              }
            </div>
          </div>
          <div id="heatmap" className="center">
            <div id="cal-heatmap" className="hide"></div>
            {Object.keys(this.state.user).length > 0 ?
              this.state.eventParticipantsIds.indexOf(this.state.user._id) > -1 ?
                <a
                  className="waves-effect waves-light btn"
                  onClick={this.showCalHeatmap}
                >Enter my availability</a> :
                <a
                  className="waves-effect waves-light btn"
                  onClick={this.joinEvent}
                >Join Event</a> :
              <p>Login/Sign Up to enter your availability!</p>
            }
            <a
              className="waves-effect waves-light btn hide"
              onClick={this.submitAvailability}
            >Submit</a>
          </div>
          <br />
          <div>
            <h6><strong>Participants</strong></h6>
            {event.participants.map((participant, index) => (
              <div className="participant" styleName="participant" key={index}>
                <img
                  className="circle"
                  styleName="participant-img"
                  src={participant.avatar}
                  alt="participant avatar"
                />
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
