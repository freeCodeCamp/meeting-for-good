'use strict';

import express from 'express';
import { isAuth } from '../utils/api.utils';
import { index, indexByName, relatedUsers, me, show, upsert, create, destroy, isUserAuthenticated, patch } from './user.controller';

const router = express.Router();

router.get('/', isAuth, index);
router.get('/isAuthenticated', isUserAuthenticated);
router.get('/byName/:name', isAuth, indexByName);
router.get('/relatedUsers', isAuth, relatedUsers);
router.get('/me', isAuth, me);
router.get('/:id', isAuth, show);
router.patch('/:id', isAuth, patch);
router.put('/:id', isAuth, upsert);
router.post('/', isAuth, create);
router.delete('/:id', isAuth, destroy);

module.exports = router;
