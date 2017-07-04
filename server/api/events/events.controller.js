/**
 * Using Rails-like standard naming convention for endpoints.
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

import Events from './events.model';

import { respondWithResult, patchUpdates, handleEntityNotFound, handleError, upsertModel, destroyModel } from '../utils/api.utils';

const filterOutStatusZeroParticipants = () => (event) => {
  if (!event) {
    return null;
  }
  event.participants = event.participants.filter(participant => participant.status !== 0);
  return event;
};

// Make a false delete setting the active to false
const setFalse = (req, res) => {
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
const index = (req, res) =>
  Events.find({ active: true }).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));

// Gets that event
const indexById = (req, res) => {
  const uid = req.params.uid;
  return Events.find({ uid, active: true })
    .exec()
    .then(filterOutStatusZeroParticipants())
    .then(respondWithResult(res))
    .catch(handleError(res));
};

// Gets all events that a especified user is participant
const indexByUser = (req, res) => {
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
const show = async (req, res) => {
  try {
    const event = await Events.findById({ _id: req.params.id })
      .populate('participants.userId', 'avatar emails name')
      .exec();
    if (!event) {
      res.status(404).end();
      return null;
    }
    event.participants = event.participants.filter(participant => participant.status !== 0);
    console.log('show', event);
    return res.status(200).json(event);
  } catch (err) {
    res.status(500).send(err);
  }
};

const showFull = (req, res) =>
  Events.findById({ _id: req.params.id })
    .populate('participants.userId', 'avatar emails name')
    .exec()
    .then(respondWithResult(res))
    .catch(handleError(res));


// Updates an existing Event in the DB
const patch = (req, res) => {
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
const destroy = (req, res) => destroyModel(req, res, Events);

// Upserts the given Event in the DB at the specified ID
const upsert = (req, res) => upsertModel(req, res, Events);

// Creates a new Event in the DB
const create = (req, res) => {
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
const GuestNotificationDismiss = (req, res) =>
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
const setGuestInactive = (req, res) =>
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

export {
  index, indexById, indexByUser, show, create, upsert, patch, setFalse,
  destroy, GuestNotificationDismiss, setGuestInactive, showFull,
};
