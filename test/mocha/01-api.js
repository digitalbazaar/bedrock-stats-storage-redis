/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const cache = require('bedrock-redis');
const mockData = require('./mock.data');
const storage = require('bedrock-stats-storage-redis');
const should = require('chai').should();
const {util: {clone}} = require('bedrock');

describe('api', () => {
  describe('insert API', () => {
    beforeEach(async () => {
      await cache.client.flushall();
    });
    it('stores a report with one monitor', async () => {
      const createdDate = 1551285871;
      const aReport = {statOne: 1, statTwo: 2};
      await storage.insert({
        report: {
          createdDate,
          monitors: {
            a: aReport
          }
        }
      });
      const redisKey = storage.keys.monitor('a');
      const result = await cache.client.zrange(redisKey, 0, -1, 'WITHSCORES');
      should.exist(result);
      result.should.be.an('array');
      result.should.have.length(2);
      const report = JSON.parse(result[0]);
      delete report._nonce;
      report.should.eql(aReport);
      const created = parseInt(result[1]);
      created.should.equal(createdDate);
    });
    it('stores two reports with one monitor', async () => {
      const createdDate1 = 1551285871;
      const createdDate2 = 1551286871;
      const aReport1 = {statOne: 1, statTwo: 2};
      const aReport2 = {statOne: 3, statTwo: 4};
      await storage.insert({
        report: {createdDate: createdDate1, monitors: {a: aReport1}}
      });
      await storage.insert({
        report: {createdDate: createdDate2, monitors: {a: aReport2}}
      });
      const redisKey = storage.keys.monitor('a');
      const result = await cache.client.zrange(redisKey, 0, -1, 'WITHSCORES');
      should.exist(result);
      result.should.be.an('array');
      result.should.have.length(4);
      let report = JSON.parse(result[0]);
      delete report._nonce;
      report.should.eql(aReport1);
      let created = parseInt(result[1]);
      created.should.equal(createdDate1);
      report = JSON.parse(result[2]);
      delete report._nonce;
      report.should.eql(aReport2);
      created = parseInt(result[3]);
      created.should.equal(createdDate2);
    });
    it('stores a report with two monitors', async () => {
      const createdDate = 1551285871;
      const aReport = {statOne: 1, statTwo: 2};
      const bReport = {bStatOne: 1, bStatTwo: 2};
      await storage.insert({
        report: {
          createdDate,
          monitors: {
            a: aReport,
            b: bReport,
          }
        }
      });
      let redisKey = storage.keys.monitor('a');
      let result = await cache.client.zrange(redisKey, 0, -1, 'WITHSCORES');
      should.exist(result);
      result.should.be.an('array');
      result.should.have.length(2);
      const reportA = JSON.parse(result[0]);
      delete reportA._nonce;
      reportA.should.eql(aReport);
      let created = parseInt(result[1]);
      created.should.equal(createdDate);
      redisKey = storage.keys.monitor('b');
      result = await cache.client.zrange(redisKey, 0, -1, 'WITHSCORES');
      should.exist(result);
      result.should.be.an('array');
      result.should.have.length(2);
      const reportB = JSON.parse(result[0]);
      delete reportB._nonce;
      reportB.should.eql(bReport);
      created = parseInt(result[1]);
      created.should.equal(createdDate);
    });
    it.skip('performance - inserts a lot of reports', async function() {
      this.timeout(60000);
      for(const report of mockData.reports.performance) {
        await storage.insert({report});
      }
    });
  }); // end insert API

  describe('find API', () => {
    it('properly returns all reports in report set one', async () => {
      await _initSet('set1');
      const result = await storage.find({monitorIds: ['a', 'b']});
      result.should.eql(mockData.reports.set1);
    });
    it('properly returns all reports in report set two', async () => {
      await _initSet('set2');
      const result = await storage.find({monitorIds: ['a', 'b']});
      result.should.eql(mockData.reports.set2);
    });
    it('performs a query with startDate', async () => {
      await _initSet('set1');
      const startDate = mockData.reportStartTime + 50000;
      const result = await storage.find({monitorIds: ['a', 'b'], startDate});
      result.should.eql(mockData.reports.set1.slice(50));
    });
    it('performs a query with endDate', async () => {
      await _initSet('set1');
      const endDate = mockData.reportStartTime + 50000;
      const result = await storage.find({endDate, monitorIds: ['a', 'b']});
      result.should.eql(mockData.reports.set1.slice(0, 51));
    });
    it('performs a query for monitor "a"', async () => {
      await _initSet('set1');
      const result = await storage.find({monitorIds: ['a']});
      const expectedSet = clone(mockData.reports.set1);
      for(const report of expectedSet) {
        delete report.monitors.b;
      }
      result.should.eql(expectedSet);
    });
    it('performs a query for monitor "b"', async () => {
      await _initSet('set1');
      const result = await storage.find({monitorIds: ['b']});
      const expectedSet = clone(mockData.reports.set1);
      for(const report of expectedSet) {
        delete report.monitors.a;
      }
      result.should.eql(expectedSet);
    });
  }); // end find API

  describe('getMonitors API', () => {
    it('returns a list of monitor IDs', async () => {
      await _initSet('set1');
      const result = await storage.getMonitorIds();
      should.exist(result);
      result.should.be.an('array');
      result.should.have.length(2);
      result.should.have.same.members(['a', 'b']);
    });
  }); // end getMonitors API

  describe('trimHistory API', () => {
    it('removes all history', async () => {
      await _initSet('set1');
      const beforeDate = Date.now();
      const r = await storage.trimHistory({beforeDate});
      // redis reports that 100 members were removed from both sets
      r.should.eql([100, 100]);
      let result = await cache.client.zrange(
        storage.keys.monitor('a'), 0, -1, 'WITHSCORES');
      should.exist(result);
      result.should.be.an('array');
      result.should.have.length(0);
      result = await cache.client.zrange(
        storage.keys.monitor('b'), 0, -1, 'WITHSCORES');
      should.exist(result);
      result.should.be.an('array');
      result.should.have.length(0);
    });
    it('partially removes history', async () => {
      await _initSet('set1');
      const beforeDate = mockData.reportStartTime + 50000;
      const r = await storage.trimHistory({beforeDate});
      // redis reports that 51 members were removed from both sets
      r.should.eql([51, 51]);
      let result = await cache.client.zrange(
        storage.keys.monitor('a'), 0, -1, 'WITHSCORES');
      should.exist(result);
      result.should.be.an('array');
      result.should.have.length(49 * 2);
      result = await cache.client.zrange(
        storage.keys.monitor('b'), 0, -1, 'WITHSCORES');
      should.exist(result);
      result.should.be.an('array');
      result.should.have.length(49 * 2);
    });
  }); // end trimHistory API
});

async function _initSet(setId) {
  await cache.client.flushall();
  for(const report of mockData.reports[setId]) {
    await storage.insert({report});
  }
}
