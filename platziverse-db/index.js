'use strict'

const setupDatabase = require('./lib/db')
const setupAgentModel = require('./models/agent')
const setupMetricModel = require('./models/metric')
const setupAgent = require('./lib/agent')
const setupMetric = require('./lib/metric')
const defaults = require('defaults')

module.exports = async function (config) {
  config = defaults(config, {
    dialect: 'sqlite',
    pool: {
      max: 10,
      min: 0,
      idle: 10000
    },
    query: {
      raw: true
    }
  })

  const sequelize = setupDatabase(config)
  const AgentModel = setupAgentModel(config)
  const MetrictModel = setupMetricModel(config)

  AgentModel.hasMany(MetrictModel)
  MetrictModel.belongsTo(AgentModel)

  await sequelize.authenticate()

  // sequelize.sync()

  if (config.setup) await sequelize.sync({ force: true })

  const Agent = setupAgent(AgentModel)
  const Metric = setupMetric(MetrictModel, AgentModel)

  return {
    Agent,
    Metric
  }
}
