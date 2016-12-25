/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/users                  ->  index
 * POST    /api/users                  ->  create
 * GET     /api/users/:id              ->  show
 * PUT     /api/users/:id              ->  upsert
 * PATCH   /api/users/:id              ->  patch
 * DELETE  /api/users/:id              ->  destroy
 * get     /api/users/byName/:name     -> indexByName
 */

import jsonpatch from 'fast-json-patch';
import Users from './user.model';


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
  return (err) => {
    res.status(statusCode).send(err);
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

// Gets a list of all  users
export const index = (req, res) => {
  return Users.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
};

// Gets a list of all  users filter by name
export const indexByName = (req, res) => {
  const name = req.params.name;
  return Users.find({ name: `/${name}/i` }).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
};

// Gets a single user from the DB
export const show = (req, res) => {
  return Users.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
};

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
export const destroy = (req, res) => {
  return Users.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
};

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
export const create = (req, res) => {
  return Users.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
};

/**
 * Get my info
 */
export const me = (req, res, next) => {
  console.log(req);
  const userId = req.params.id;
  return Users.findOne({ _id: userId }).exec()
    .then((user) => {
      if (!user) {
        return res.status(401).end();
      }
      res.json(user);
    })
    .catch(err => next(err));
};


