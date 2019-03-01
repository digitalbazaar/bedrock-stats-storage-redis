/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const _constants = require('./constants');
const bedrock = require('bedrock');
const brJobs = require('bedrock-jobs');
const cache = require('bedrock-redis');
const {config, util: {clone}} = bedrock;
const assert = require('assert-plus');
const keys = require('./keys');

require('./config');
const cfg = config['stats-storage-redis'];

bedrock.events.on('bedrock.start', async () => {
  const jobQueue = exports._jobQueue = brJobs.addQueue(
    {name: _constants.JOB_QUEUE});
  // setup a processor for the queue with the default concurrency of 1
  jobQueue.process(async () => {
    const beforeDate = Date.now() - cfg.history.ttl;
    return exports.trimHistory({beforeDate});
  });
  await jobQueue.add({}, {
    // prevent duplicate jobs by specifying a non-unique jobId
    jobId: 'trimHistory',
    // repeated jobs are completed and rescheduled on every iteration
    repeat: {every: cfg.history.trimInterval},
    // do not keep record of successfully completed jobs in redis
    removeOnComplete: true
  });
});

/**
 * @module bedrock-stats-storage-redis
 */

exports.keys = keys;

/**
 * @description Query stats history.
 * @param {Object} options - The options to use.
 * @param {string[]} options.monitorIds - The monitorIds to query.
 * @param {number|string} [options.endDate='+inf'] - The end date for the query
 *   in ms since epoch.
 * @param {number|string} [options.startDate='-inf'] - The start date for the
 *   query in ms since epoch.
 *
 * @returns {Promise<Object>} A collated history for the specified monitorIds.
 */
exports.find = async ({endDate = '+inf', monitorIds, startDate = '-inf'}) => {
  assert.array(monitorIds);
  const txn = cache.client.multi();
  for(const monitorId of monitorIds) {
    const redisKey = keys.monitor(monitorId);
    txn.zrangebyscore(redisKey, startDate, endDate, 'WITHSCORES');
  }
  const result = await txn.exec();
  let monitorCounter = 0;
  const reportMap = new Map();
  // collate the results from all the monitors
  for(const monitorId of monitorIds) {
    const monitorReport = result[monitorCounter];
    for(let i = 0; i < monitorReport.length; i += 2) {
      const createdDate = parseInt(monitorReport[i + 1]);
      const reportFromMap = reportMap.get(createdDate);
      const report = reportFromMap || {};
      report[monitorId] = JSON.parse(monitorReport[i]);
      // remove the nonce
      delete report[monitorId]._nonce;
      if(!reportFromMap) {
        reportMap.set(createdDate, report);
      }
    }
    monitorCounter++;
  }
  // the dates collected from the various monitors in reportMap may not be
  // in chronological order, sort the reports
  const dates = Array.from(reportMap.keys());
  dates.sort((a, b) => a - b);
  const reports = [];
  for(const d of dates) {
    reports.push({
      createdDate: d,
      monitors: reportMap.get(d)
    });
  }
  return reports;
};

/**
 * @description Insert stats into history.
 * @param {Object} options - The options to use.
 * @param {Object} options.report - The report to insert.
 *
 * @returns {Promise} The Redis transaction summary.
 */
exports.insert = async ({report}) => {
  assert.object(report);
  const {createdDate, monitors} = report;
  assert.number(createdDate, 'report.createdDate');
  assert.object(monitors, 'report.monitors');
  const txn = cache.client.multi();
  for(const monitorId in monitors) {
    const redisKey = keys.monitor(monitorId);
    // createdDate is used as a nonce here to ensure uniqueness
    const r = clone(monitors[monitorId]);
    r._nonce = createdDate;
    txn.zadd(redisKey, createdDate, JSON.stringify(r));
  }
  const monitorIds = Object.keys(monitors);
  txn.sadd(keys.monitorSet(), monitorIds);
  return txn.exec();
};

/**
 * @description Trim stats history.
 * @param {Object} options - The options to use.
 * @param {number} options.beforeDate - All history before this
 *   date(ms since epoch) will be removed from history.
 *
 * @returns {Promise} The Redis transaction summary.
 */
exports.trimHistory = async ({beforeDate}) => {
  assert.number(beforeDate);
  // smembers always returns an array even if the set does not exist
  const monitorIds = await cache.client.smembers(keys.monitorSet());
  const txn = cache.client.multi();
  for(const monitorId of monitorIds) {
    txn.zremrangebyscore(keys.monitor(monitorId), '-inf', beforeDate);
  }
  return txn.exec();
};
