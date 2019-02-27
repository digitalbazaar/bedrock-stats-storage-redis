/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const _constants = require('./constants');

// this key stores reports for individual monitors
exports.monitor = monitorId =>
  `${_constants.STATS_PREFIX}|${_constants.MONITOR_PREFIX}|${monitorId}`;

// this set tracks all the monitors in the system
exports.monitorSet = () =>
  `${_constants.STATS_PREFIX}|${_constants.MONITOR_PREFIX}`;
