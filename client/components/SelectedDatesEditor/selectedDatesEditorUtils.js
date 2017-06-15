import Moment from 'moment';
import { extendMoment } from 'moment-range';
import _ from 'lodash';

const moment = extendMoment(Moment);

export const filterAvailabilitysOutsideDatesRange = (event) => {
  const nEvent = _.cloneDeep(event);
  // clear all availiability of each participant at nEvent
  // so i can push only the valid ones
  nEvent.participants.forEach((participant) => {
    if (participant.availability.length > 0) participant.availability = [];
  },
  );
  // only push availability on range
  event.dates.forEach((date) => {
    const rangeDates = moment.range(moment(date.fromDate), moment(date.toDate));
    event.participants.forEach((participant, index) => {
      participant.availability.forEach((avail) => {
        const rangeAvail = moment.range(moment(avail[0]), moment(avail[1]));
        if (rangeAvail.overlaps(rangeDates, { adjacent: false })) {
          nEvent.participants[index].availability.push(avail);
        }
      });
    });
  });
  return nEvent;
};

export const createDatesRange = (dates) => {
  let datesRanges = dates.map((date) => {
    const range = moment.range(moment(date.fromDate).startOf('date'), moment(date.toDate).startOf('date'));
    return Array.from(range.by('days'));
  });
  datesRanges = _.flatten(datesRanges);
  datesRanges.sort((a, b) => {
    const x = a.clone().unix();
    const y = b.clone().unix();
    return x - y;
  });
  datesRanges = datesRanges.map(date => moment(date)._d);
  return datesRanges;
};

export const dateRangeReducer = (selectedDates, event) => {
  // first save the inicial and  final original times
  const initialHour = moment(event.dates[0].fromDate).hour();
  const initialMinutes = moment(event.dates[0].fromDate).minutes();
  const finalHour = moment(event.dates[0].toDate).hour();
  const finalMinutes = moment(event.dates[0].toDate).minutes();
  const nSelectedDates = _.cloneDeep(selectedDates);
  nSelectedDates.sort((a, b) => {
    const x = moment(a).unix();
    const y = moment(b).unix();
    return x - y;
  });
  // create the first range with the fist select date
  let initialDate = moment(nSelectedDates[0]).startOf('date').hour(initialHour).minutes(initialMinutes);
  let finalDate = moment(nSelectedDates[0]).startOf('date').hour(finalHour).minutes(finalMinutes);
  let rangeToCompare = moment.range(initialDate, finalDate);
  const allRanges = [];
  if (selectedDates.length > 1) {
    nSelectedDates.shift();
    nSelectedDates.forEach((date) => {
      finalDate = moment(date).startOf('date').hour(finalHour).minutes(finalMinutes);
      // if is adjacent expand the range
      const dateToCompare = moment(rangeToCompare.end).startOf('date').add(1, 'day');
      if (dateToCompare.isSame(moment(date).startOf('date'))) {
        rangeToCompare = moment.range(rangeToCompare.start, finalDate);
      } else {
        // its a new range
        allRanges.push(rangeToCompare);
        initialDate = moment(date).startOf('date').hour(initialHour).minutes(initialMinutes);
        rangeToCompare = moment.range(initialDate, finalDate);
      }
    });
    allRanges.push(rangeToCompare);
  } else {
    return [{ fromDate: initialDate._d, toDate: finalDate._d }];
  }

  return allRanges.map(range => ({ fromDate: range.start._d, toDate: range.end._d }));
};
