'use strict';

import express from 'express';
import { listCalendars, listEvents } from './gg-calendar.controller';
import { isAuth } from '../utils/api.utils';

const router = express.Router();

router.get('/listEvents/:calendarId/:minDate/:maxDate', isAuth, listEvents);
router.get('/list', isAuth, listCalendars);

module.exports = router;
