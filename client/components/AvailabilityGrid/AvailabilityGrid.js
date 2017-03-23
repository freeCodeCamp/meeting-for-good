import React from 'react';
import cssModules from 'react-css-modules';
import _ from 'lodash';
import moment from 'moment';
import autobind from 'autobind-decorator';
import colorsys from 'colorsys';
import jsonpatch from 'fast-json-patch';
import jz from 'jstimezonedetect';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';

import styles from './availability-grid.css';
import { getHours, getMinutes, removeZero } from '../../util/time-format';
import { getDaysBetween } from '../../util/dates.utils';
import { getTimesBetween } from '../../util/times.utils';
import enteravail from '../../assets/enteravail.gif';

class AvailabilityGrid extends React.Component {
  constructor(props) {
    super(props);

    let dateFormatStr = 'Do MMM ddd';

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
      openModal: false,
    };
  }

  componentWillMount() {
    const allDates = _.flatten(this.props.dates.map(({ fromDate, toDate }) =>
      getDaysBetween(fromDate, toDate),
    ));

    const allTimes = _.flatten([this.props.dates[0]].map(({ fromDate, toDate }) =>
      getTimesBetween(fromDate, toDate),
    ));

    const allDatesRender = allDates.map(date => moment(date).format(this.state.dateFormatStr));
    const allTimesRender = allTimes.map(time => moment(time).format('hh:mm a'));

    allTimesRender.pop();

    const hourTime = allTimesRender
      .filter(time => String(time).split(':')[1].split(' ')[0] === '00');

    const lastHourTimeEl = hourTime.slice(-1)[0];
    const lastAllTimesRenderEl = allTimesRender.slice(-1)[0];

    if (getHours(lastHourTimeEl) !== getHours(lastAllTimesRenderEl) || getMinutes(lastAllTimesRenderEl) === 45) {
      hourTime.push(
        moment(new Date())
        .set('h', getHours(lastHourTimeEl))
        .set('m', getMinutes(lastHourTimeEl))
        .add(1, 'h')
        .format('hh:mm a'),
      );
    }

    this.setState({ allDates, allTimes, allDatesRender, allTimesRender, hourTime });
  }

  componentDidMount() {
    if (this.props.heatmap) this.renderHeatmap();
    if (this.props.myAvailability && this.props.myAvailability.length > 0) this.renderAvail();

    $('.cell').on('click', (e) => {
      if (!this.props.heatmap) this.addCellToAvail(e);
    });

    // Offset the grid-hour row if the event starts with a date that's offset by
    // 15/30/45 minutes.
    const gridHour = document.querySelector('.grid-hour');
    const { allTimesRender } = this.state;

    if (getMinutes(allTimesRender[0]) === 15) {
      gridHour.setAttribute('style', 'margin-left: 50.6px !important');
    } else if (getMinutes(allTimesRender[0]) === 30) {
      gridHour.setAttribute('style', 'margin-left: 38px !important');
    } else if (getMinutes(allTimesRender[0]) === 45) {
      gridHour.setAttribute('style', 'margin-left: 25.2px !important');
    }

    // Change the border of the cell if it's minutes = 0 or 30 to help visually
    // separate 15 minute blocks from 30 minute and 1 hour blocks.
    const cells = document.querySelectorAll('.cell');

    cells.forEach((cell) => {
      if (getMinutes(cell.getAttribute('data-time')) === 0) {
        cell.style.borderLeft = '1px solid rgb(120, 120, 120)';
      } else if (getMinutes(cell.getAttribute('data-time')) === 30) {
        cell.style.borderLeft = '1px solid #c3bebe';
      }
    });

    // Check if two adjacent grid hours labels are consecutive or not. If not, then split the grid
    // at this point.
    const hourTime = this.state.hourTime.slice(0);

    for (let i = 0; i < hourTime.length; i += 1) {
      if (hourTime[i + 1]) {
        const date = moment(new Date());
        const nextDate = moment(new Date());

        date.set('h', getHours(hourTime[i]));
        date.set('m', getMinutes(hourTime[i]));

        nextDate.set('h', getHours(hourTime[i + 1]));
        nextDate.set('m', getMinutes(hourTime[i + 1]));

        // date.add (unfortunately) mutates the original moment object. Hence we don't add an hour
        // to the object again when it's inserted into this.state.hourTime.
        if (date.add(1, 'h').format('hh:mm') !== nextDate.format('hh:mm')) {
          $(`.cell[data-time='${nextDate.format('hh:mm a')}']`).css('margin-left', '50px');

          // 'hack' (the modifyHourTime function) to use setState in componentDidMount and bypass
          // eslint. Using setState in componentDidMount couldn't be avoided in this case.
          this.modifyHourTime(hourTime, date, i);
        }
      }
    }
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

  modifyHourTime(hourTime, date, i) {
    // inserts the formatted date object at the 'i+1'th index in this.state.hourTime.
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

    const patches = jsonpatch.generate(observerEvent);
    await this.props.submitAvail(patches);
  }

  @autobind
  editAvailability() {
    this.props.editAvail();
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

  renderDialog() {
    const { openModal } = this.state;
    const actions = [
      <FlatButton
        label="close"
        primary
        onTouchTap={() => this.setState({ openModal: false })}
      />,
    ];
    const inlineStyles = {
      modal: {
        content: {
          width: '38%',
          maxWidth: '38%',
        },
        bodyStyle: {
          paddingTop: 10,
          fontSize: '25px',
        },
      },
    };

    return (
      <Dialog
        contentStyle={inlineStyles.modal.content}
        bodyStyle={inlineStyles.modal.bodyStyle}
        actions={actions}
        modal
        open={openModal}
      >
        <h4>This is how you can enter and remove your availablity:</h4>
        <img src={enteravail} alt="entering availablity gif" />
      </Dialog>
    );
  }

  render() {
    const { allDatesRender, allTimesRender, hourTime } = this.state;
    const { dates } = this.props;
    return (
      <div styleName="Column">
        <div styleName="row">
          <FlatButton
            primary
            onClick={() => this.setState({ openModal: true })}
          >
            How do I use the grid?
          </FlatButton>
        </div>
        <div styleName="selectbox" id="selectbox" />
        {hourTime.map((time, i) => {
          return (
            <p
              key={i}
              className="grid-hour"
              styleName="grid-hour"
            >{`${removeZero(time.split(':')[0])} ${time.split(' ')[1]}`}</p>
          );
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
                  onMouseEnter={this.showAvailBox}
                  onMouseLeave={this.hideAvailBox}
                />
              );
            })}
          </div>
        ))}
        <p styleName="info"><em>Each time slot represents 15 minutes.</em></p>
        <p styleName="info"><em>Displaying all times in your local timezone: {jz.determine().name()}.</em></p>
        <br />
        <div className="center">
          {this.props.heatmap ?
            <RaisedButton
              labelColor="#ffffff"
              backgroundColor="#000000"
              label="Edit Availability"
              onClick={this.editAvailability}
            />
            :
            <RaisedButton
              labelColor="#ffffff"
              backgroundColor="#000000"
              label="Submit"
              onClick={this.submitAvailability}
            />
          }
        </div>
        <div styleName="hover-container">
          {this.state.availableOnDate.length > 0 ?
            <div styleName="hover-available">
              <h5>Available</h5>
              {this.state.availableOnDate.map((participant, i) => <h6 key={i}>{participant}</h6>)}
            </div> :
            null
          }
          {this.state.notAvailableOnDate.length > 0 ?
            <div styleName="hover-available">
              <h5>Unavailable</h5>
              {this.state.notAvailableOnDate.map((participant, i) => <h6 key={i}>{participant}</h6>)}
            </div> :
            null
          }
        </div>
        {this.renderDialog()}
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
  participants: React.PropTypes.array,
  event: React.PropTypes.object,
};

export default cssModules(AvailabilityGrid, styles);
