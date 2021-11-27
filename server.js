'use strict'

const debug = require('debug')('platziverse:mqtt')
const aedes = require('aedes')
const redis = require('redis')
const mqemitter = require('mqemitter-redis')
const redisPersistence = require('aedes-persistence-redis')
const chalk = require('chalk')

const backend = {
    type: 'redis',
    redis,
    return_buffers: true
}

const settings = {
    port: 1883,
    backend
}