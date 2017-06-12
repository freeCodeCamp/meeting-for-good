/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/user                  ->  index
 * GET     /api/user/me               ->  me
 * POST    /api/user                  ->  create
 * GET     /api/user/:id              ->  show
 * PUT     /api/user/:id              ->  upsert
 * PATCH   /api/user/:id              ->  patch
 * DELETE  /api/user/:id              ->  destroy
 * GET     /api/user/byName/:name     -> indexByName
 *GET     /api/user/relatedUsers/     -> relatedUsers
 */

import jsonpatch from 'fast-json-patch';
import Users from './user.model';
import Events from '../events/events.model';

const respondWithResult = (res, statusCode) => {
  statusCode = statusCode || 200;
  return (entity) => {
    if (entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
};

const handleError = (res, statusCode) => {
  statusCode = statusCode || 500;
  // console.log('handleError userController', res);
  return (err) => {
    res.status(statusCode).send(err);
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

const removeEntity = res => (entity) => {
  if (entity) {
    return entity.remove()
      .then(() => {
        res.status(204).end();
      });
  }
};

const handleEntityNotFound = res => (entity) => {
  if (!entity) {
    res.status(404).end();
    return null;
  }
  return entity;
};

// Gets a list of all  users
export const index = (req, res) => Users.find().exec()
  .then(respondWithResult(res))
  .catch(handleError(res));

// Gets a list of all  users filter by name
export const indexByName = (req, res) => {
  const name = req.params.name;
  return Users.find({ name: new RegExp(name, 'i') }).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
};

// Gets a single user from the DB
export const show = (req, res) => Users.findById(req.params.id).exec()
  .then(handleEntityNotFound(res))
  .then(respondWithResult(res))
  .catch(handleError(res));

// Upserts the given user in the DB at the specified ID
export const upsert = (req, res) => {
  if (req.body._id) {
    delete req.body._id;
  }
  return Users.findOneAndUpdate({ _id: req.params.id },
    req.body,
    { upsert: true, setDefaultsOnInsert: true, runValidators: true }).exec()
    .then(respondWithResult(res))
    .catch((err) => {
      console.log('err no put', err);
      handleError(res);
    });
};

// Deletes a User from the DB
export const destroy = (req, res) => Users.findById(req.params.id).exec()
  .then(handleEntityNotFound(res))
  .then(removeEntity(res))
  .catch(handleError(res));

// Updates an existing User in the DB
export const patch = (req, res) => {
  if (req.body._id) {
    delete req.body._id;
  }

  return Users.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
};

// Creates a new User in the DB
export const create = (req, res) => Users.create(req.body)
  .then(respondWithResult(res, 201))
  .catch(handleError(res));

/**
 * Get my info
 */
export const me = (req, res, next) => {
  const userId = req.user._id;
  return Users.findOne({ _id: userId }).exec()
    .then((user) => {
      if (!user) {
        return res.status(401).end();
      }
      res.json(user);
    })
    .catch(err => next(err));
};

// find all users that i alredy meet.
export const relatedUsers = (req, res) => {
  // find all events that this user partipated
  const curUserId = req.user._id.toString();
  return Events.find()
    .where('participants.userId').equals(curUserId)
    .populate('participants.userId', 'avatar emails name')
    .exec()
    .then((events) => {
      if (!events) {
        return res.status(401).end();
      }
      const guests = [];
      const listIds = [];
      events.forEach((event) => {
        event.participants.forEach((participant) => {
          const participantId = participant.userId._id.toString();
          // if is not the current participant and its not pushed yet
          if (participantId !== curUserId && listIds.indexOf(participantId) === -1) {
            listIds.push(participantId);
            guests.push(participant);
          }
        });
      });
      return guests;
    })
    .then(respondWithResult(res))
    .catch((err) => {
      console.log('error at relatedUsers', err);
      return handleError(res);
    });
};

export const isAuthenticated = (req, res) => {
  if (req.user) return res.status(200).json({ isAuthenticated: true });
  return res.status(200).json({ isAuthenticated: false });
};
