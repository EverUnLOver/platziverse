'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const metricFixture = require('./fixtures/metric')
const agentFixture = require('./fixtures/agent')

const config = {
  logging: function () {}
}

const metric = Object.assign({}, metricFixture.single)
const agent = Object.assign({}, agentFixture.single)
const uuid = agent.uuid
const type = 'memory'
let MetricStub = null
let AgentStub = null
let db = null
let sandbox = null
let createdMetric = null
let newMetric = null
let allMetricsByTypesArgs = null
let allMetricTypesArgs = null

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  AgentStub = {
    hasMany: sandbox.spy()
  }

  MetricStub = {
    belongsTo: sandbox.spy()
  }

  allMetricTypesArgs = {
    attributes: ['type'],
    group: ['type'],
    include: [{
      attributes: [],
      model: AgentStub,
      where: { uuid }
    }],
    raw: true
  }

  allMetricsByTypesArgs = {
    attributes: ['id', 'type', 'value', 'createdAt'],
    where: { type },
    limit: 20,
    order: [['createdAt', 'DESC']],
    include: [{
      attributes: [],
      model: AgentStub,
      where: { uuid }
    }],
    raw: true
  }

  newMetric = {
    agentId: 1,
    type: 'memory',
    value: '1000'
  }

  createdMetric = Object.assign(Object.assign({}, metric), newMetric)

  // AgentModel findOne Stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs({ where: { uuid } }).returns(Promise.resolve(agentFixture.byUuid(uuid)))

  // MetricModel findAll Stub
  MetricStub.findAll = sandbox.stub()
  MetricStub.findAll.withArgs(allMetricTypesArgs).returns(Promise.resolve(metricFixture.byAgentId(agentFixture.byUuid(uuid).id)))
  MetricStub.findAll.withArgs(allMetricsByTypesArgs).returns(Promise.resolve(metricFixture.byTypeAgentId(type, agentFixture.byUuid(uuid).id)))

  // MetricModel create Stub
  MetricStub.create = sandbox.stub()
  MetricStub.create.withArgs(newMetric).returns(Promise.resolve({ toJSON: () => createdMetric }))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })
  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

test('Agent', t => {
  t.truthy(db.Agent, 'Agent service should exists')
})

test('Metric', t => {
  t.truthy(db.Metric, 'Metric service shoulb exists')
})

test.serial('Metric#create', async t => {
  const metric = await db.Metric.create(uuid, newMetric)

  t.true(MetricStub.create.called, 'create should be called on model')
  t.true(MetricStub.create.calledOnce, 'create should be called once')
  t.true(MetricStub.create.calledWith(newMetric), 'argument should be called with the specified new metric object')

  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(AgentStub.findOne.calledWith({ where: { uuid } }), 'argument should be called with the specified uuid')

  t.deepEqual(metric, createdMetric, 'metric should be the same')
})

test.serial('Metric#findByAgentUuid', async t => {
  const metrics = await db.Metric.findByAgentUuid(uuid)

  t.true(MetricStub.findAll.called, 'findAll should be called on model')
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once')
  t.true(MetricStub.findAll.calledWith(allMetricTypesArgs), 'argument should be called with the specified uuid')

  t.deepEqual(metrics, metricFixture.byAgentId(agentFixture.byUuid(uuid).id), 'metrics should be the same')
})

test.serial('Metric#findByTypeAgentUuid', async t => {
  const metrics = await db.Metric.findByTypeAgentUuid(type, uuid)

  t.true(MetricStub.findAll.called, 'findAll should be called on model')
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once')
  t.true(MetricStub.findAll.calledWith(allMetricsByTypesArgs), 'argument should be called with the specified uuid')

  t.deepEqual(metrics, metricFixture.byTypeAgentId(type, agentFixture.byUuid(uuid).id), 'metrics should be the same')
})
