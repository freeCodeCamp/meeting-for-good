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

import Users from './user.model';
import Events from '../events/events.model';
import { respondWithResult, patchUpdates, handleError, handleEntityNotFound, upsertModel, destroyModel } from '../utils/api.utils';


// Gets a list of all  users
const index = (req, res) => Users.find().exec()
  .then(respondWithResult(res))
  .catch(handleError(res));

// Gets a list of all  users filter by name
const indexByName = (req, res) => {
  const name = req.params.name;
  return Users.find({ name: new RegExp(name, 'i') }).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
};

// Gets a single user from the DB
const show = (req, res) => Users.findById(req.params.id).exec()
  .then(handleEntityNotFound(res))
  .then(respondWithResult(res))
  .catch(handleError(res));

// Upserts the given user in the DB at the specified ID
const upsert = (req, res) => upsertModel(req, res, Users);

// Deletes a User from the DB
const destroy = (req, res) => destroyModel(req, res, Users);

// Updates an existing User in the DB
const patch = (req, res) => {
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
const create = (req, res) => Users.create(req.body)
  .then(respondWithResult(res, 201))
  .catch(handleError(res));

/**
 * Get my info
 */
const me = (req, res, next) => {
  const userId = req.user._id;
  return Users.findOne({ _id: userId }).exec()
    .then((user) => {
      if (!user) res.status(401).end();
      res.json(user);
    })
    .catch(err => next(err));
};

// find all users that i alredy meet.
const relatedUsers = (req, res) => {
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

const isUserAuthenticated = (req, res) => {
  if (req.user) return res.status(200).json({ isAuthenticated: true });
  return res.status(200).json({ isAuthenticated: false });
};

export {
  isUserAuthenticated, relatedUsers, me, create, patch, destroy, upsert, show, indexByName, index,
};
