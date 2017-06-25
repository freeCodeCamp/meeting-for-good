'use strict';

import express from 'express';
import { isAuth } from '../utils/api.utils';
import { index, indexByUser, indexById, showFull, show, create, upsert, GuestNotificationDismiss, patch, setGuestInactive, setFalse } from './events.controller';

const router = express.Router();

router.get('/', isAuth, index);
router.get('/getByUser/:actualDate?', isAuth, indexByUser);
router.get('/getbyuid/:uid', isAuth, indexById);
router.get('/getFull/:id', isAuth, showFull);
router.get('/:id', isAuth, show);
router.post('/', isAuth, create);
router.put('/:id', isAuth, upsert);
router.patch('/GuestNotificationDismiss/:id', isAuth, GuestNotificationDismiss);
router.patch('/:id', isAuth, patch);
router.delete('/participant/:id', isAuth, setGuestInactive);
router.delete('/:id', isAuth, setFalse);

module.exports = router;
