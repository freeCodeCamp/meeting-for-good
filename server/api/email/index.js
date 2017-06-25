'use strict';

import express from 'express';
import { ownerNotification, sendInvite, ownerNotificationForEdit } from './email.controller';
import { isAuth } from '../utils/api.utils';

const router = express.Router();

router.post('/ownerNotification', isAuth, ownerNotification);
router.post('/sendInvite', isAuth, sendInvite);
router.post('/ownerNotificationForEventEdit', isAuth, ownerNotificationForEdit);

module.exports = router;
