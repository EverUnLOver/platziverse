'use strict'

function parsePayload (payload) {
  if (payload instanceof Buffer) {
    payload = payload.toString('utf8')
  }

  try {
    payload = JSON.parse(payload)
  } catch (err) {
    payload = {}
  }

  return payload
}

function clone (obj, values) {
  return Object.assign({}, obj, values)
}

module.exports = {
  parsePayload,
  clone
}
