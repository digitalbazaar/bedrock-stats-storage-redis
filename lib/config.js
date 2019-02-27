/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {config} = require('bedrock');

const cfg = config['stats-storage-redis'] = {};

cfg.history = {};
// the TTL of history to maintain in redis, default 1 hour
cfg.history.ttl = 60 * 60 * 1000;
// frequency that history will be trimmed, default 1 minute
cfg.history.trimInterval = 60 * 1000;
