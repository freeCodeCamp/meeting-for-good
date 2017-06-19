/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/getStats                              ->  getStats
 * GET     /api/events                                ->  index
 * GET     /api/events/getbyuid/:uid'                 ->  indexById
 * GET    /api/events/getbyUser                       ->  indexByUser
 * POST    /api/events                                ->  create
 * GET     /api/events/getFull/:id                    ->  showFull
 * GET     /api/events/:id                            ->  show
 * PUT     /api/events/:id                            ->  upsert
 * PATCH   /api/events/:id                            ->  patch
 * PATCH   /api/events/GuestNotificationDismiss/:id   ->  GuestNotificationDismiss
 * DELETE  /api/events/:id                            ->  setFalse
 * DELETE  /api/events/participant:id                 ->  setGuestInactive
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Events from './events.model';

const respondWithResult = (res, statusCode) => {
  statusCode = statusCode || 200;
  return (entity) => {
    if (entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
};

const patchUpdates = patches => (entity) => {
  try {
    jsonpatch.applyPatch(entity, patches, /* validate */ true);
  } catch (err) {
    console.log('err at patches', err);
    return Promise.reject(err);
  }
  return entity.save();
};

const removeEntity = res =>
  (entity) => {
    if (entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };

const handleEntityNotFound = res =>
  (entity) => {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };

const handleError = (res, statusCode) => {
  statusCode = statusCode || 500;
  return (err) => {
    console.log('handleError at event.controler', err);
    res.status(statusCode).send(err);
  };
};

const filterOutStatusZeroParticipants = () => (event) => {
  if (!event) {
    return null;
  }
  event.participants = event.participants.filter(participant => participant.status !== 0);
  return event;
};

// Calculate application statistics
export const getStats = (req, res) => {
  let nbrUsers = 0;
  let nbrEvents = 0;
  let nbrActiveEvents = 0;
  let nbrParticipants = 0;
  const usersMap = {};

  Events.find({}, (err, events) => {
    nbrEvents = events.length;
    events.forEach((event) => {
      if (event.active) {
        nbrActiveEvents += 1;
      }
      nbrParticipants += event.participants.length;
      usersMap[event.owner] = true;
    });
    nbrUsers = Object.keys(usersMap).length;

    const stats = {
      users: nbrUsers,
      events: nbrEvents,
      activeEvents: nbrActiveEvents,
      participants: nbrParticipants,
    };
    return res.status(200).json(stats);
  });
};

// Make a false delete setting the active to false
export const setFalse =  (req, res) => {
  Events.findById(req.params.id, (err, event) => {
    if (err) return res.status(500).send(err);
    if (!event || !event.active) return res.status(404).send('Not found.');
    event.active = false;
    event.save((err) => {
      if (err) {
        console.log('err at setFalse', err);
        return res.status(500).send(err);
      }
      return res.status(200).json(event);
    });
  });
};

// Gets a list of all active events
export const index = (req, res) =>
  Events.find({ active: true }).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));

// Gets that event
export const indexById = (req, res) => {
  const uid = req.params.uid;
  return Events.find({ uid, active: true })
    .exec()
    .then(filterOutStatusZeroParticipants())
    .then(respondWithResult(res))
    .catch(handleError(res));
};

// Gets all events that a especified user is participant
export const indexByUser = (req, res) => {
  const actualDate = (req.params.actualDate) ? req.params.actualDate : new Date(1970, 1, 1);
  return Events.find({
    'participants.userId': req.user._id.toString(),
  })
    .where('active').equals(true)
    .where('dates.toDate')
    .gte(actualDate)
    .populate('participants.userId', 'avatar emails name')
    .exec()
    .then((events) => {
      events.forEach((event) => {
        event.participants = event.participants.filter(participant => participant.status !== 0);
      });
      return events;
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
};

// Gets a single Event from the DB
export const show = (req, res) =>
  Events.findById(req.params.id)
    .populate('participants.userId', 'avatar emails name')
    .exec()
    .then(filterOutStatusZeroParticipants())
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));

// Updates an existing Event in the DB
export const patch = (req, res) => {
  if (req.body._id) {
    delete req.body._id;
  }

  return Events.findById(req.params.id)
    .exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(res => Events.findById(res._id)
        .populate('participants.userId', 'avatar emails name')
        .exec())
    .then(filterOutStatusZeroParticipants())
    .then(respondWithResult(res))
    .catch(handleError(res));
};

// Deletes a Event from the DB
export const destroy = (req, res) =>
  Events.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));

// Upserts the given Event in the DB at the specified ID
export const upsert = (req, res) => {
  if (req.body._id) {
    delete req.body._id;
  }
  return Events.findOneAndUpdate({ _id: req.params.id },
    req.body,
    { upsert: true, setDefaultsOnInsert: true, runValidators: true }).exec()
    .then(respondWithResult(res))
    .catch((err) => {
      console.log('err no put', err);
      handleError(res);
    });
};

// Creates a new Event in the DB
export const create = (req, res) => {
  const { _id } = req.user;
  const userId = _id.toString();
  req.body.participants = [{ userId }];
  req.body.owner = userId;
  req.body.active = true;

  return Events.create(req.body)
    .then((res) => {
      // populate the userId
      const nEvent = Events.findById({ _id: res._id })
        .populate('participants.userId', 'avatar emails name')
        .exec();
      return nEvent;
    })
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
};

// set the owner notification for that participants._id as true
export const GuestNotificationDismiss = (req, res) =>
  Events.findOne({
    'participants._id': req.params.id,
  })
    .exec()
    .then(handleEntityNotFound(res))
    .then((event) => {
      event.participants.id(req.params.id).ownerNotified = true;
      return event.save();
    })
    .then(res =>
      Events.findById({ _id: res._id })
        .populate('participants.userId', 'avatar emails name')
        .exec())
    .then(respondWithResult(res))
    .catch(handleError(res));

// set the guest as inactive
export const setGuestInactive = (req, res) =>
  Events.findOne({ 'participants._id': req.params.id })
    .exec()
    .then((event) => {
      event.participants.id(req.params.id).status = 0;
      event.participants.id(req.params.id).availability = [];
      return event.save();
    })
    .then(res =>
      Events.findById({ _id: res._id })
        .populate('participants.userId', 'avatar emails name')
        .exec())
    .then(filterOutStatusZeroParticipants())
    .then(respondWithResult(res))
    .catch(handleError(res));

export const showFull = (req, res) =>
  Events.findById({ _id: req.params.id })
    .populate('participants.userId', 'avatar emails name')
    .exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
