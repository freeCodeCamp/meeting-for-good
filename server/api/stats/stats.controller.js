'use strict';

import Events from '../events/events.model';

const handleError = (res, statusCode) => {
  statusCode = statusCode || 500;
  return (err) => {
    console.log('handleError at event.controler', err);
    res.status(statusCode).send(err);
  };
};

const computeDayOfYear = (now) => {
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

const countTodaysEvents = (res, stats) => {
  const dayOfYear = computeDayOfYear(new Date());

  Events.aggregate()
    .project({ _id: 0, dates: 1 })
    .unwind('$dates')
    .project({
      fromDay: { $dayOfYear: '$dates.fromDate' },
      toDay: { $dayOfYear: '$dates.toDate' },
    })
    .match({ $and: [{ fromDay: { $lte: dayOfYear } },
                    { toDay: { $gte: dayOfYear } }],
    })
    .exec()
    .then((days) => {
      stats.eventsToday = days.length;

      res.status(200).json(stats);
    })
    .catch(handleError(res));
};

const countParticipants = (res, stats) => {
  Events.aggregate()
    .project({ _id: 0, count: { $size: '$participants' } })
    .group({
      _id: 1,
      total: { $sum: '$count' },
      max: { $max: '$count' },
      avg: { $avg: '$count' },
    })
    .exec()
    .then((results) => {
      stats.participants = results[0].total;
      stats.maxParticipants = results[0].max;
      stats.avgParticipants = Math.floor(results[0].avg + 0.5);
    })
    .then(() => countTodaysEvents(res, stats))
    .catch(handleError(res));
};

const countDistinctUsers = (res, stats) => {
  Events.distinct('owner')
    .then((results) => { stats.users = results.length; })
    .then(() => countParticipants(res, stats))
    .catch(handleError(res));
};

const countActive = (res, stats) => {
  Events.count()
    .where('active').eq(true)
    .then((count) => { stats.activeEvents = count; })
    .then(() => countDistinctUsers(res, stats))
    .catch(handleError(res));
};

const countAll = (res, stats) => {
  Events.count()
    .exec()
    .then((count) => { stats.events = count; })
    .then(() => countActive(res, stats))
    .catch(handleError(res));
};

// Calculate application statistics
export const getStats = (req, res) => {
  const stats = {};
  countAll(res, stats);
};
