'use strict';

const express = require('express');
const controller = require('./stats.controller');

const router = express.Router();

router.get('/getStats', controller.getStats);

module.exports = router;
