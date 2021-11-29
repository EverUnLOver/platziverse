'use strict'

import debug from 'debug'
// import redis from 'redis'
import mqemitter from 'mqemitter-redis'
import aedes from 'aedes'
import redisPersistence from 'aedes-persistence-redis'
import chalk from 'chalk'
import net from 'net'
import db from 'platziverse-db'
import { parsePayload } from './utils.js'
// const chalk = (...args) => import('chalk').then(({ default: chalk }) => chalk(...args))

const LOG = debug('platziverse:mqtt')

const setting = {
  port: process.env.REDIS_PORT || 6379,
  host: process.env.REDIS_HOST || 'localhost',
  family: 4
}

const config = {
  database: process.env.DB_NAME || 'platziverse',
  username: process.env.DB_USER || 'platzi',
  password: process.env.DB_PASS || 'platzi',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  logging: s => LOG(s)
}

const mq = mqemitter(setting)
const persistence = redisPersistence(setting)
const broker = aedes({
  mq,
  persistence
})

const server = net.createServer(broker.handle)
const port = process.env.MQTT_PORT || 1883
const clients = new Map()

let Agent, Metric, payload

broker.on('client', client => {
  // console.log(`${chalk.green('[platziverse-mqtt]')} client connected`, client.id)
  LOG(`Client Connected: ${client.id}`)
  clients.set(client.id, null)
})

broker.on('clientDisconnect', async client => {
  // console.log(`${chalk.green('[platziverse-mqtt]')} client disconnected`, client.id)
  LOG(`Client Disconnected: ${client.id}`)
  const agent = clients.get(client.id)

  if (agent) {
    // Mark Agent as offline
    agent.connected = false

    try {
      await Agent.createOrUpdate(agent)
    } catch (err) {
      return handleError(err)
    }

    // Delete Agent from Clients list
    clients.delete(client.id)

    broker.publish({
      topic: 'agent/disconnected',
      payload: JSON.stringify({
        agent: {
          uuid: agent.uuid
        }
      })
    })
    LOG(`Client (${client.id}) associated to Agent (${agent.uuid}) marked as disconnected`)
  }
})

broker.on('publish', async (packet, client) => {
  // console.log(`${chalk.green('[platziverse-mqtt]')} client published`, packet.topic, packet.payload)
  LOG(`Received: ${packet.topic}`)

  switch (packet.topic) {
    case 'agent/connected':
    case 'agent/disconnected':
      LOG(`Payload: ${packet.payload}`)
      break
    case 'agent/message':
      payload = parsePayload(packet.payload)

      if (!payload) {
        LOG(`Invalid payload: ${packet.payload}`)
      } else {
        payload.agent.connected = true

        let agent
        try {
          agent = await Agent.createOrUpdate(payload.agent)
        } catch (e) {
          return handleError(e)
        }

        LOG(`Agent: ${agent.uuid} saved`)

        // Notify Agent is Connected
        if (!clients.get(client.id)) {
          clients.set(client.id, agent)
          broker.publish({
            topic: 'agent/connected',
            payload: JSON.stringify({
              agent: {
                uuid: agent.uuid,
                name: agent.name,
                hostname: agent.hostname,
                pid: agent.pid,
                connected: agent.connected
              }
            })
          })
        }

        // Store Metrics
        const saveMetricsPromises = payload.metrics.map(async (metric) => {
          let m

          try {
            m = await Metric.create(agent.uuid, metric)
          } catch (e) {
            return handleError(e)
          }

          LOG(`Metric ${m.id} saved on agent ${agent.uuid}`)
        })
      }
      break
  }
})

broker.on('clientError', handleFatalError)

server.listen(port, async function () {
  // console.log('server listening on port', port)
  console.log(`${chalk.green('[platziverse-mqtt]')}' server listening on port ${port}`)
  const services = await db(config).catch(handleFatalError)
  console.log(`${chalk.green('[platziverse-mqtt]')} Database connected`)
  Agent = services.Agent
  Metric = services.Metric
})

function handleFatalError (err) {
  console.error(`${chalk.red('[message error]')} ${err.message}`)
  console.error(`${chalk.red('[stack error]')} ${err.stack}`)
  process.exit(1)
}

function handleError (err) {
  console.error(`${chalk.red('[message error]')} ${err.message}`)
  console.error(`${chalk.red('[stack error]')} ${err.stack}`)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
