'use strict';

import moment from 'moment';

import Events from '../events/events.model';
import Stats from './stats.model';

import { handleError } from '../utils/api.utils';

const showError = msg => err => console.log(msg, ': ', err);

const writeStatsIntoDatabase = (stats) => {
  Stats.findOne()
    .then((doc) => {
      if (!doc) {
        Stats.create(stats);
      } else {
        doc.events = stats.events;
        doc.users = stats.users;
        doc.maxParticipants = stats.maxParticipants;
        doc.avgParticipants = stats.avgParticipants;
        doc.eventsToday = stats.eventsToday;
        doc.weekAvg = stats.weekAvg;
        doc.save();
      }
      return null;
    })
    .catch(showError('writeStatsIntoDatabase'));
};

const computeAvgEventsForWeek = (stats) => {
  const obj = {};
  // Disable eslint here because we must use non-ES6 functions in Mongo's mapReduce.
  // Also, variables provided by the "scope" setting will appear to lint to be
  // undefined.  Furthermore, the "emit" function will appear to be undefined.
  /* eslint-disable */
  obj.map = function (foo) {
    if (this._id.getTimestamp() >= sevenDaysAgo) {
      emit(0, 1);
    }
  };
  obj.reduce = function (id, values) {
    return values.length;
  };
/* eslint-enable */
  obj.scope = {
    sevenDaysAgo: new Date().getTime() - (1000 * 60 * 60 * 24 * 7),
  };
  obj.out = { inline: 1 };
  Events.mapReduce(obj)
    .then((results) => {
      stats.weekAvg = Math.floor(((results[0].value / 7) * 10) + 0.5) / 10;

      writeStatsIntoDatabase(stats);
      return null;
    })
    .catch(showError('computeAvgEventsForWeek'));
};

const countTodaysEvents = (stats) => {
  const dayOfYear = moment().dayOfYear();

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
      computeAvgEventsForWeek(stats);
      return null;
    })
    .catch(showError('countTodaysEvents'));
};

const countParticipants = (stats) => {
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
      stats.avgParticipants = Math.floor((results[0].avg * 10) + 0.5) / 10;
      countTodaysEvents(stats);
      return null;
    })
    .catch(showError('countParticipants'));
};

const countDistinctUsers = (stats) => {
  Events.distinct('owner')
    .exec()
    .then((results) => {
      stats.users = results.length;
      countParticipants(stats);
      return null;
    })
    .catch(showError('countDistinctUsers'));
};

const countAll = (stats) => {
  Events.count()
    .exec()
    .then((count) => {
      stats.events = count;
      countDistinctUsers(stats);
      return null;
    })
    .catch(showError('countAll'));
};

export const computeStats = () => {
  const stats = {};
  countAll(stats);
};

// Calculate application statistics
export const getStats = (req, res) => {
  Stats.findOne()
    .then(stats => res.status(200).json(stats))
    .catch(handleError(res));
};
