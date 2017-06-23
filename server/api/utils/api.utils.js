import jsonpatch from 'fast-json-patch';

const isAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(403).send('Authentiation required.');
};

const respondWithResult = (res, statusCode = 200) => (entity) => {
  if (entity) return res.status(statusCode).json(entity);
  return null;
};

const removeEntity = res => (entity) => {
  if (entity) entity.remove().then(() => res.status(204).end());
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

const handleError = (res, statusCode = 500) => err => res.status(statusCode).send(err);

const handleEntityNotFound = res => (entity) => {
  if (!entity) {
    res.status(404).end();
    return null;
  }
  return entity;
};

// Upserts the given Event in the DB at the specified ID
const upsertModel = (req, res, model) => {
  if (req.body._id) delete req.body._id;
  return model.findOneAndUpdate({ _id: req.params.id },
    req.body,
    { upsert: true, setDefaultsOnInsert: true, runValidators: true }).exec()
    .then(respondWithResult(res))
    .catch((err) => {
      console.log('err no put', err);
      handleError(res);
    });
};

// Deletes a User from the DB
const destroyModel = (req, res, model) => model.findById(req.params.id).exec()
  .then(handleEntityNotFound(res))
  .then(removeEntity(res))
  .catch(handleError(res));

export {
  isAuth, respondWithResult, removeEntity, patchUpdates,
  handleError, handleEntityNotFound, upsertModel, destroyModel,
};
