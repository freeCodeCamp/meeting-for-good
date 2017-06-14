import jz from 'jstimezonedetect';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import _ from 'lodash';
import React from 'react';
import { ListItem } from 'material-ui/List';

const moment = extendMoment(Moment);

export const renderTzInfo = () => {
  if (location.pathname === '/dashboard') {
    return (
      <div styleName="info">
        <p>
          <em>
            Displaying all times in your local timezone: {jz.determine().name()}
          </em>
        </p>
      </div>);
  }
  return null;
};

export const renderRows = (hours) => {
  const rows = [];
  hours.forEach((hour) => {
    const hourToShow = (
      <spam style={{ fontColor: '#000000', fontWeight: 200 }}>
        {hour}
      </spam >
    );
    const row = (
      <ListItem
        key={hour}
        disabled
        primaryText={hourToShow}
        style={{ paddingLeft: '33px' }}
        innerDivStyle={{ height: '0px', paddingTop: '0px' }}
      />
    );
    rows.push(row);
  });
  return rows;
};

export const buildAvailabilitys = (event) => {
  const availabilitys = [];
  // clean the availability and tranform each avail in a range of moments with 15 min long
  // to be able to calculate the overlaps
  event.participants.forEach((participant) => {
    if (participant.availability !== undefined) {
      const availability = participant.availability.map((avail) => {
        const datesRange = moment.range([moment(avail[0]), moment(avail[1])]);
        const quartersFromDtRange = Array.from(datesRange.by('minutes', { exclusive: true, step: 15 }));
        const quartersToAvail = [];
        quartersFromDtRange.forEach(date =>
          quartersToAvail.push([moment(date), moment(date).add(15, 'm')]));
        return quartersToAvail;
      });
      availabilitys.push(_.flatten(availability));
    }
  });
  return availabilitys;
};

export const createOverlaps = (availabilitys) => {
  const overlaps = [];
  if (availabilitys.length > 1) {
    // need to find the participant with less availabilitys to be the base one;
    availabilitys.sort((a, b) => a.length - b.length);
    // now calculate the overlaps
    const smallestAvail = availabilitys.splice(0, 1);
    // calculates the overlaps
    for (let i = 0; i < smallestAvail[0].length; i += 1) {
      const currentQuarter = smallestAvail[0][i];
      let count = 0;
      for (let j = 0; j < availabilitys.length; j += 1) {
        let k = 0;
        while (k < availabilitys[j].length && !currentQuarter[0].isSame(availabilitys[j][k][0])) {
          k += 1;
        }
        if (k < availabilitys[j].length) {
          count += 1;
        }
      }
      if (count === availabilitys.length) {
        overlaps.push(currentQuarter);
      }
    }
  }
  overlaps.sort((a, b) => {
    const x = a[0].clone().unix();
    const y = b[0].clone().unix();
    return x - y;
  });

  return overlaps;
};

export const buildBestTimes = (event) => {
  const availabilitys = buildAvailabilitys(event);
  const overlaps = createOverlaps(availabilitys);
  const displayTimes = {};
  if (overlaps.length !== 0) {
    let index = 0;
    // for all overlaps calculated
    for (let i = 0; i < overlaps.length; i += 1) {
      const curOverlapDay = overlaps[index][0].format('DD MMM');
      const curOverlapEnd = overlaps[i][1];
      if (overlaps[i + 1] !== undefined && !curOverlapEnd.isSame(overlaps[i + 1][0])) {
        // if dosn't alreedy have that day create that day
        if (displayTimes[curOverlapDay] === undefined) {
          displayTimes[curOverlapDay] = {};
          displayTimes[curOverlapDay].hours = [];
        }
        // push the overlaped range
        displayTimes[curOverlapDay]
          .hours.push(`${overlaps[index][0].format('h:mm a')} to ${curOverlapEnd.format('h:mm a')}`);
        index = i + 1;
        // dont have a next overlap, its the last one
      } else if (overlaps[i + 1] === undefined) {
        if (displayTimes[curOverlapDay] === undefined) {
          displayTimes[curOverlapDay] = {};
          displayTimes[curOverlapDay].hours = [];
        }
        displayTimes[curOverlapDay]
          .hours.push(`${overlaps[index][0].format('h:mm a')} to ${curOverlapEnd.format('h:mm a')}`);
      }
    }
  }
  return displayTimes;
};
