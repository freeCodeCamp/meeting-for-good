import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import autobind from 'autobind-decorator';
import fetch from 'isomorphic-fetch';
import colorsys from 'colorsys';
import nprogress from 'nprogress';
import jsonpatch from 'fast-json-patch';
import { checkStatus } from '../util/fetch.util';
import { getHours, getMinutes, removeZero } from '../util/time-format';
import { getDaysBetween } from '../util/dates.utils';
import { getTimesBetween } from '../util/times.utils';
import AvailabilityGrid from './AvailabilityGrid';

export default class AvailabilityGridContainer extends React.Component {
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
      availableOnDate: [],
      notAvailableOnDate: [],
      hourTime: [],
      startCell: null,
      endCell: null,
    };
  }

  componentWillMount() {
    const { dates } = this.props;

    const allDates = _.flatten(dates.map(({ fromDate, toDate }) =>
      getDaysBetween(fromDate, toDate),
    ));

    const allTimes = _.flatten([dates[0]].map(({ fromDate, toDate }) =>
      getTimesBetween(fromDate, toDate),
    ));

    const allDatesRender = allDates.map(date =>
      moment(date).format(this.state.dateFormatStr),
    );

    const allTimesRender = allTimes.map(time =>
      moment(time).format('hh:mm a'),
    );

    allTimesRender.pop();

    const hourTime = allTimesRender
      .filter(time => String(time).split(':')[1].split(' ')[0] === '00');

    const lastHourTimeEl = hourTime.slice(-1)[0];
    const lastAllTimesRenderEl = allTimesRender.slice(-1)[0];

    if (getHours(lastHourTimeEl) !== getHours(lastAllTimesRenderEl) ||
        getMinutes(lastAllTimesRenderEl) === 45) {
      hourTime.push(
        moment(new Date())
        .set('h', getHours(lastHourTimeEl))
        .set('m', getMinutes(lastHourTimeEl))
        .add(1, 'h')
        .format('hh:mm a'),
      );
    }

    this.setState({
      allDates,
      allTimes,
      allDatesRender,
      allTimesRender,
      hourTime,
    });
  }

  getPosition(el) {
    let xPosition = 0;
    let yPosition = 0;
    let xScrollPos;
    let yScrollPos;

    while (el) {
      if (el.tagName === 'BODY') {
        // deal with browser quirks with body/window/document and page scroll
        xScrollPos = el.scrollLeft || document.documentElement.scrollLeft;
        yScrollPos = el.scrollTop || document.documentElement.scrollTop;
        xPosition += (el.offsetLeft - xScrollPos + el.clientLeft);
        yPosition += (el.offsetTop - yScrollPos + el.clientTop);
      } else {
        xPosition += (el.offsetLeft - el.scrollLeft + el.clientLeft);
        yPosition += (el.offsetTop - el.scrollTop + el.clientTop);
      }
      el = el.offsetParent;
    }
    return {
      x: xPosition,
      y: yPosition,
    };
  }

  @autobind
  modifyHourTime(hourTime, date, i) {
    // inserts the formatted date object at the 'i+1'th index in
    // this.state.hourTime.
    this.setState({
      hourTime: [
        ...hourTime.slice(0, i + 1),
        date.format('hh:mm a'),
        ...hourTime.slice(i + 1),
      ],
    });
  }

  @autobind
  showAvailBox(ev) {
    if (this.props.heatmap && $(ev.target).css('background-color') !== 'rgba(0, 0, 0, 0)') {
      const { allTimesRender, allDatesRender, allDates, allTimes } = this.state;
      let formatStr = 'Do MMMM YYYY hh:mm a';
      const availableOnDate = [];
      const notAvailableOnDate = [];

      if (this.props.weekDays) formatStr = 'ddd hh:mm a';
      const participants = JSON.parse(JSON.stringify(this.props.participants))
        .filter(participant => participant.availability)
        .map((participant) => {
          participant.availability = participant.availability
            .map(avail => new Date(avail[0]))
            .map(avail => moment(avail).format(formatStr));
          return participant;
        });

      const timeIndex = allTimesRender.indexOf(ev.target.getAttribute('data-time'));
      const dateIndex = allDatesRender.indexOf(ev.target.getAttribute('data-date'));

      const date = moment(allDates[dateIndex]).get('date');
      const cellFormatted = moment(allTimes[timeIndex]).set('date', date).format(formatStr);

      participants.forEach((participant) => {
        if (participant.availability.indexOf(cellFormatted) > -1) {
          availableOnDate.push(participant.name);
        } else {
          notAvailableOnDate.push(participant.name);
        }
      });

      this.setState({ availableOnDate, notAvailableOnDate });
    }
  }

  @autobind
  hideAvailBox() {
    this.setState({ availableOnDate: [], notAvailableOnDate: [] });
  }

  @autobind
  addCellToAvail(e) {
    if ($(e.target).css('background-color') !== 'rgb(128, 0, 128)') {
      $(e.target).css('background-color', 'purple');
    } else {
      $(e.target).css('background-color', 'white');
    }

    if (this.state.startCell === null) this.setState({ startCell: $(e.target) });
    else {
      this.setState({ endCell: $(e.target) });

      let startCell = this.state.startCell;
      const endCell = this.state.endCell;

      if (startCell.css('background-color') === 'rgb(128, 0, 128)' && endCell.css('background-color') === 'rgb(128, 0, 128)') {
        if (startCell.index() < endCell.index()) {
          while (startCell.attr('data-time') !== endCell.attr('data-time')) {
            startCell.next().css('background-color', 'rgb(128, 0, 128)');
            startCell = startCell.next();
          }
        } else if (startCell.index() > endCell.index()) {
          while (startCell.attr('data-time') !== endCell.attr('data-time')) {
            startCell.prev().css('background-color', 'rgb(128, 0, 128)');
            startCell = startCell.prev();
          }
        }
      } else if (startCell.css('background-color') === 'rgb(255, 255, 255)' && endCell.css('background-color') === 'rgb(255, 255, 255)') {
        if (startCell.index() < endCell.index()) {
          while (startCell.attr('data-time') !== endCell.attr('data-time')) {
            startCell.next().css('background-color', 'rgb(255, 255, 255)');
            startCell = startCell.next();
          }
        } else if (startCell.index() > endCell.index()) {
          while (startCell.attr('data-time') !== endCell.attr('data-time')) {
            startCell.prev().css('background-color', 'rgb(255, 255, 255)');
            startCell = startCell.prev();
          }
        }
      }

      this.setState({ startCell: null });
      this.setState({ endCell: null });
    }
  }

  @autobind
  async submitAvailability() {
    const { allDates, allTimes, allDatesRender, allTimesRender } = this.state;
    const availability = [];

    $('.cell').each((i, el) => {
      if ($(el).css('background-color') === 'rgb(128, 0, 128)') {
        const timeIndex = allTimesRender.indexOf($(el).attr('data-time'));
        const dateIndex = allDatesRender.indexOf($(el).attr('data-date'));

        const date = moment(allDates[dateIndex]).get('date');

        const from = moment(allTimes[timeIndex]).set('date', date)._d;
        const to = moment(allTimes[timeIndex + 1]).set('date', date)._d;

        availability.push([from, to]);
      }
    });

    const { _id } = this.props.user;
    const event = JSON.parse(JSON.stringify(this.props.event));
    const observerEvent = jsonpatch.observe(event);
    event.participants = event.participants.map((user) => {
      if (user.userId === _id) user.availability = availability;
      return user;
    });

    nprogress.configure({ showSpinner: false });
    nprogress.start();
    const patches = jsonpatch.generate(observerEvent);
    const response = await fetch(
      `/api/events/${event._id}`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
        body: JSON.stringify(patches),
        credentials: 'same-origin',
      },
    );

    try {
      checkStatus(response);
    } catch (err) {
      console.log('err at PATCH AvailabilityGrid', err);
      return;
    } finally {
      nprogress.done();
    }

    this.props.submitAvail(availability);
  }

  @autobind
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
      new Date(avail[0]),
    ).map(avail =>
      moment(avail).format(formatStr),
    );

    flattenedAvailability.forEach((avail) => {
      if (availabilityNum[avail]) availabilityNum[avail] += 1;
      else availabilityNum[avail] = 1;
    });

    cells.forEach((cell) => {
      const timeIndex = allTimesRender.indexOf(cell.getAttribute('data-time'));
      const dateIndex = allDatesRender.indexOf(cell.getAttribute('data-date'));

      const date = moment(allDates[dateIndex]).get('date');
      const cellFormatted = moment(allTimes[timeIndex]).set('date', date).format(formatStr);

      cell.style.background = colors[availabilityNum[cellFormatted]];
    });
  }

  @autobind
  renderAvail() {
    const cells = document.querySelectorAll('.cell');
    const { allTimesRender, allDatesRender, allDates, allTimes } = this.state;
    const formatStr = 'Do MMMM YYYY hh:mm a';
    const myAvailabilityFrom = this.props.myAvailability
                                    .map(avail => new Date(avail[0]))
                                    .map(avail => moment(avail).format(formatStr));

    cells.forEach((cell) => {
      const timeIndex = allTimesRender.indexOf(cell.getAttribute('data-time'));
      const dateIndex = allDatesRender.indexOf(cell.getAttribute('data-date'));

      const date = moment(allDates[dateIndex]).get('date');
      const cellFormatted = moment(allTimes[timeIndex]).set('date', date).format(formatStr);

      if (myAvailabilityFrom.indexOf(cellFormatted) > -1) {
        cell.style.background = 'purple';
      }
    });
  }

  render() {
    const {
      dates,
      heatmap,
      user,
      availability,
      myAvailability,
      participants,
      event,
    } = this.props;

    const {
      allTimesRender,
      hourTime,
      allDatesRender,
      dateFormatStr,
      availableOnDate,
      notAvailableOnDate,
    } = this.state;

    const childProps = {
      dates,
      heatmap,
      user,
      availability,
      myAvailability,
      participants,
      event,
      allTimesRender,
      hourTime,
      allDatesRender,
      dateFormatStr,
      availableOnDate,
      notAvailableOnDate,
    };

    return (
      <AvailabilityGrid
        renderHeatmap={this.renderHeatmap}
        renderAvail={this.renderAvail}
        addCellToAvail={this.addCellToAvail}
        modifyHourTime={this.modifyHourTime}
        showAvailBox={this.showAvailBox}
        hideAvailBox={this.hideAvailBox}
        editAvailability={this.editAvail}
        submitAvailability={this.submitAvailability}
        {...childProps}
      />
    );
  }
}

AvailabilityGridContainer.propTypes = {
  dates: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  heatmap: React.PropTypes.bool,
  weekDays: React.PropTypes.bool,
  user: React.PropTypes.object,
  availability: React.PropTypes.array,
  submitAvail: React.PropTypes.func,
  editAvail: React.PropTypes.func,
  myAvailability: React.PropTypes.array,
  participants: React.PropTypes.array,
  event: React.PropTypes.object,
};

