'use strict'

const metric = {
  id: 1,
  agentId: 1,
  type: 'memory',
  value: 100,
  createdAt: new Date(),
  updatedAt: new Date()
}

const metrics = [
  metric,
  extent(metric, { id: 2, value: 200, agentId: 2 }),
  extent(metric, { id: 3, value: 300, agentId: 1 }),
  extent(metric, { id: 4, type: 'cpu', value: 8 })
]

function extent (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

module.exports = {
  single: metric,
  all: metrics,
  byTypeAgentId: (type, id) => metrics.filter(a => a.type === type && a.agentId === id).map(({ id, type, value, createdAt }) => ({ id, type, value, createdAt })),
  byAgentId: id => {
    const counst = {}
    metrics.filter(
      a => a.agentId === id
    ).map(
      ({ type }) => {
        counst[type] = (counst[type] || 0) + 1
        return type
      }
    )
    console.log(counst)
    return counst
  }
}
