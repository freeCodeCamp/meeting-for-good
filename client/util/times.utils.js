import moment from 'moment';

export const getTimesBetween = (start, end) => {
  let times = [start];
  let currentTime = start;

  if (moment(end).hour() === 0) {
    end = moment(end)
      .subtract(1, 'd')
      .hour(23)
      .minute(59)._d;
  }

  if (moment(end).hour() < moment(start).hour()) {
    // days are split
    currentTime = moment(start)
      .set('hour', 0)
      .set('minute', 0)._d;
    times = [currentTime];

    if (moment(end).hour() === 0) times = [];

    while (moment(end).hour() > moment(times.slice(-1)[0]).hour()) {
      currentTime = moment(currentTime).add(15, 'm')._d;
      times.push(currentTime);
    }

    currentTime = moment(currentTime)
      .set('hour', moment(start).get('hour'))
      .set('minute', moment(start).get('minute'))._d;

    times.pop();
    times.push(currentTime);

    while (moment(times.slice(-1)[0]).hour() > 0) {
      currentTime = moment(currentTime).add(15, 'm')._d;
      times.push(currentTime);
    }
  } else {
    end = moment(end)
      .set('date', moment(start).get('date'))
      .set('month', moment(start).get('month'))
      .set('year', moment(start).get('year'))
      ._d;

    while (moment(end).isAfter(moment(times.slice(-1)[0]))) {
      currentTime = moment(currentTime).add(15, 'm')._d;
      times.push(currentTime);
    }
  }

  return times;
};

