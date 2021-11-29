'use strict'

export function parsePayload (payload) {
  if (payload instanceof Buffer) {
    payload = payload.toString('utf8')
  }

  try {
    payload = JSON.parse(payload)
  } catch (err) {
    payload = null
  }

  return payload
}

// function clone (obj, values) {
//   return Object.assign({}, obj, values)
// }
