import React from 'react';
import cssModules from 'react-css-modules';
import moment from 'moment';
import { getHours, getMinutes, removeZero } from '../../util/time-format';
import styles from '../../styles/availability-grid.css';

class AvailabilityGrid extends React.Component {
  componentDidMount() {
    if (this.props.heatmap) this.props.renderHeatmap();
    if (this.props.myAvailability && this.props.myAvailability.length > 0) {
      this.props.renderAvail();
    }

    $('.cell').on('click', (e) => {
      if (!this.props.heatmap) this.props.addCellToAvail(e);
    });

    // Offset the grid-hour row if the event starts with a date that's offset by
    // 15/30/45 minutes.
    const gridHour = document.querySelector('.grid-hour');
    const { allTimesRender } = this.props;

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

    // Check if two adjacent grid hours labels are consecutive or not. If not,
    // then split the grid at this point.
    const hourTime = this.props.hourTime.slice(0);

    for (let i = 0; i < hourTime.length; i += 1) {
      if (hourTime[i + 1]) {
        const date = moment(new Date());
        const nextDate = moment(new Date());

        date.set('h', getHours(hourTime[i]));
        date.set('m', getMinutes(hourTime[i]));

        nextDate.set('h', getHours(hourTime[i + 1]));
        nextDate.set('m', getMinutes(hourTime[i + 1]));

        // date.add (unfortunately) mutates the original moment object. Hence
        // we don't add an hour to the object again when it's inserted into
        // this.state.hourTime.
        if (date.add(1, 'h').format('hh:mm') !== nextDate.format('hh:mm')) {
          $(`.cell[data-time='${nextDate.format('hh:mm a')}']`).css('margin-left', '50px');

          // 'hack' (the modifyHourTime function) to use setState in
          // componentDidMount and bypass eslint. Using setState in
          // componentDidMount couldn't be avoided in this case.
          this.props.modifyHourTime(hourTime, date, i);
        }
      }
    }
  }

  render() {
    const {
      allDatesRender,
      allTimesRender,
      hourTime,
      dates,
      dateFormatStr,
    } = this.props;

    return (
      <div>
        <a
          styleName="info"
          onClick={() => document.querySelector('#showAvailHelper').showModal()}
        ><em>How do I use the grid?</em></a>
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

                if (moment(fromDate).format(dateFormatStr) === date &&
                    moment(fromDateFormatted, 'hh:mm a').isAfter(moment(time, 'hh:mm a')) ||
                    moment(toDate).format(dateFormatStr) === date &&
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
                  onMouseEnter={this.props.showAvailBox}
                  onMouseLeave={this.props.hideAvailBox}
                />
              );
            })}
          </div>
        ))}
        <p styleName="info"><em>Each time slot represents 15 minutes</em></p>
        <br />
        <div className="center">
          {this.props.heatmap ?
            <div>
              <a
                className="waves-effect waves-light btn grey darken-3"
                onClick={this.props.editAvailability}
              >Edit Availability</a>
              <br />
            </div> :
            <a
              className="waves-effect waves-light btn grey darken-3"
              onClick={this.props.submitAvailability}
            >Submit</a>
          }
        </div>
        <div styleName="hover-container">
          {this.props.availableOnDate.length > 0 ?
            <div styleName="hover-available">
              <h5>Available</h5>
              {this.props.availableOnDate.map((participant, i) =>
                <h6 key={i}>{participant}</h6>)
              }
            </div> :
            null
          }
          {this.props.notAvailableOnDate.length > 0 ?
            <div styleName="hover-available">
              <h5>Unavailable</h5>
              {this.props.notAvailableOnDate.map((participant, i) =>
                <h6 key={i}>{participant}</h6>)
              }
            </div> :
            null
          }
        </div>
        <dialog
          onClick={ev => ev.stopPropagation()}
          className="mdl-dialog"
          styleName="mdl-dialog"
          id="showAvailHelper"
        >
          <p className="mdl-dialog__title">
            This is how you can enter and remove your availablity:
          </p>
          <div className="mdl-dialog__actions">
            <img
              src="https://cdn.rawgit.com/AkiraLaine/LetsMeet/development/client/assets/enteravail.gif"
              alt="entering availablity gif"
            />
            <button
              type="button"
              className="mdl-button close"
              onClick={() => document.querySelector('#showAvailHelper').close()}
            >Cancel</button>
          </div>
        </dialog>
      </div>
    );
  }
}

AvailabilityGrid.propTypes = {
  dates: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  heatmap: React.PropTypes.bool,
  user: React.PropTypes.object,
  availability: React.PropTypes.array,
  myAvailability: React.PropTypes.array,
  participants: React.PropTypes.array,
  event: React.PropTypes.object,
  renderHeatmap: React.PropTypes.func,
  renderAvail: React.PropTypes.func,
  addCellToAvail: React.PropTypes.func,
  allTimesRender: React.PropTypes.arrayOf(React.PropTypes.string),
  hourTime: React.PropTypes.array,
  modifyHourTime: React.PropTypes.func,
  allDatesRender: React.PropTypes.array,
  dateFormatStr: React.PropTypes.string,
  showAvailBox: React.PropTypes.func,
  hideAvailBox: React.PropTypes.func,
  editAvailability: React.PropTypes.func,
  submitAvailability: React.PropTypes.func,
  availableOnDate: React.PropTypes.array,
  notAvailableOnDate: React.PropTypes.array,
};

export default cssModules(AvailabilityGrid, styles);
