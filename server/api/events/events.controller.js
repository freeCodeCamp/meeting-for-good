/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/events                                ->  index
 * GET     /api/events/getbyuid/:uid'                 ->  indexById
 * GET    /api/events/getGhestsNotifications          ->  GuestNotifications
 * GET    /api/events/getbyUser                       ->  indexByUser
 * POST    /api/events                                ->  create
 * GET     /api/events/:id                            ->  show
 * PUT     /api/events/:id                            ->  upsert
 * PATCH   /api/events/:id                            ->  patch
 * PATCH   /api/events/GuestNotificationDismiss/:id   ->  GuestNotificationDismiss
 * DELETE  /api/events/:id                            ->  setFalse
 * DELETE  /api/events/participant:id                 ->  setGuestInactive
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import _ from 'lodash';
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

const patchUpdates = (patches) => {
  return (entity) => {
    try {
      jsonpatch.apply(entity, patches, /* validate */ true);
    } catch (err) {
      console.log('err at patches', err);
      return Promise.reject(err);
    }
    return entity.save();
  };
};

const removeEntity = (res) => {
  return (entity) => {
    if (entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
};

const handleEntityNotFound = (res) => {
  return (entity) => {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
};

const handleError = (res, statusCode) => {
  statusCode = statusCode || 500;
  return (err) => {
    console.log('handleError at event.controler', err);
    res.status(statusCode).send(err);
  };
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
export const index = (req, res) => {
  return Events.find({ active: true }).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
};

// Gets that event
export const indexById = (req, res) => {
  const uid = req.params.uid;
  return Events.find({ uid, active: true })
    .exec()
    .then((event) => {
      const nEvent = _.clone(event);
      event.participants.forEach((participant, indexParticipant) => {
        if (participant.status === 0) {
          nEvent.participants.splice(indexParticipant, 1);
        }
      });
      return nEvent;
    })
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
      const nEvents = _.clone(events);
      events.forEach((event, index) => {
        event.participants.forEach((participant, indexParticipant) => {
          if (participant.status === 0 && participant.userId._id.toString() === req.user._id.toString()) {
            nEvents.splice(index, 1);
          } else if (participant.status === 0) {
            nEvents[index].participants.splice(indexParticipant, 1);
          }
        });
      });
      return nEvents;
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
};

// Gets a single Event from the DB
export const show = (req, res) => {
  return Events.findById(req.params.id)
    .populate('participants.userId', 'avatar emails name')
    .exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
};

// Updates an existing Event in the DB
export const patch = (req, res) => {
  if (req.body._id) {
    delete req.body._id;
  }

  return Events.findById(req.params.id)
    .exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then((res) => {
      return Events.findById(res._id)
        .populate('participants.userId', 'avatar emails name')
        .exec();
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
};

// Deletes a Event from the DB
export const destroy = (req, res) => {
  return Events.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
};

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

// get all new guests that dont have notification
// for that event owner
export const GuestNotifications = (req, res) => {
  const { _id } = req.user;
  return Events.find({
    owner: _id.toString(),
    active: true,
  })
    .select('name participants.userId participants.name participants._id participants.ownerNotified')
    .sort({ _id: 'descending' })
    .exec()
    .then(respondWithResult(res))
    .catch((err) => {
      console.log('err at GuestNotifications', err);
      handleError(res);
    });
};

// set the owner notification for that particpants._id as true
export const GuestNotificationDismiss = (req, res) => {
  return Events.findOne({
    'participants._id': req.params.id,
  })
    .exec()
    .then(handleEntityNotFound(res))
    .then((event) => {
      event.participants.forEach((participant) => {
        if (participant._id.toString() === req.params.id) {
          participant.ownerNotified = true;
          event.save((err) => {
            if (err) {
              console.log('err at GuestNotificationDismiss', err);
              return res.status(500).send(err);
            }
            return res.status(200).json(event);
          });
        }
      });
    });
};
// set the guest as inactive
export const setGuestInactive = (req, res) => {
  return Events.findOne({ 'participants._id': req.params.id })
    .exec()
    .then((event) => {
      event.participants.id(req.params.id).status = 0;
      event.participants.id(req.params.id).availability = [];
      return event.save();
    })
    .then((res) => {
      return Events.findById({ _id: res._id })
        .populate('participants.userId', 'avatar emails name')
        .exec();
    })
    .then((event) => {
      const nEvent = _.clone(event);
      event.participants.forEach((participant, indexParticipant) => {
        if (participant.status === 0) {
          nEvent.participants.splice(indexParticipant, 1);
        }
      });
      return nEvent;
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
};
