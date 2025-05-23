/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { test } from 'tap'
import { Client, errors } from '../../../'
import { connection } from '../../utils'

let clientVersion: string = require('../../../package.json').version // eslint-disable-line
if (clientVersion.includes('-')) {
  clientVersion = clientVersion.slice(0, clientVersion.indexOf('-')) + 'p'
}
let transportVersion: string = require('@elastic/transport/package.json').version // eslint-disable-line
if (transportVersion.includes('-')) {
  transportVersion = transportVersion.slice(0, transportVersion.indexOf('-')) + 'p'
}
const nodeVersion = process.versions.node

test('Scroll search', async t => {
  let count = 0
  const MockConnection = connection.buildMockConnection({
    onRequest (params) {
      t.match(params.headers, {
        'x-elastic-client-meta': `es=${clientVersion},js=${nodeVersion},t=${transportVersion},hc=${nodeVersion},h=s`
      })

      count += 1
      if (params.method === 'POST') {
        if (params.path === '/test/_search') {
          t.equal(params.querystring, 'scroll=1m')
        } else {
          // @ts-expect-error
          t.equal(JSON.parse(params.body).scroll, '1m')
        }
      }
      if (count === 4) {
        // final automated clear
        t.equal(params.method, 'DELETE')
      }
      return {
        body: {
          _scroll_id: 'id',
          count,
          hits: {
            hits: count === 3
              ? []
              : [
                  { _source: { one: 'one' } },
                  { _source: { two: 'two' } },
                  { _source: { three: 'three' } }
                ]
          }
        }
      }
    }
  })

  const client = new Client({
    node: 'http://localhost:9200',
    Connection: MockConnection
  })

  const scrollSearch = client.helpers.scrollSearch({
    index: 'test',
    query: { match_all: {} }
  })

  for await (const result of scrollSearch) {
    // @ts-expect-error
    t.equal(result.body.count, count)
    t.equal(result.body._scroll_id, 'id')
  }
})

test('Clear a scroll search', async t => {
  let count = 0
  const MockConnection = connection.buildMockConnection({
    onRequest (params) {
      t.notMatch(params.headers, {
        'x-elastic-client-meta': `es=${clientVersion},js=${nodeVersion},t=${transportVersion},hc=${nodeVersion},h=s`
      })
      if (params.method === 'DELETE') {
        // @ts-expect-error
        const body = JSON.parse(params.body)
        t.equal(body.scroll_id, 'id')
      }
      return {
        body: {
          _scroll_id: count === 3 ? undefined : 'id',
          count,
          hits: {
            hits: [
              { _source: { one: 'one' } },
              { _source: { two: 'two' } },
              { _source: { three: 'three' } }
            ]
          }
        }
      }
    }
  })

  const client = new Client({
    node: 'http://localhost:9200',
    Connection: MockConnection,
    enableMetaHeader: false
  })

  const scrollSearch = client.helpers.scrollSearch({
    index: 'test',
    query: { match_all: {} }
  })

  for await (const result of scrollSearch) {
    if (count === 2) {
      t.fail('The scroll search should be cleared')
    }
    // @ts-expect-error
    t.equal(result.body.count, count)
    if (count === 1) {
      await result.clear()
    }
    count += 1
  }
})

test('Scroll search (retry)', async t => {
  let count = 0
  const MockConnection = connection.buildMockConnection({
    onRequest (params) {
      count += 1
      if (count === 1) {
        return { body: {}, statusCode: 429 }
      }
      if (count === 5) {
        // final automated clear
        t.equal(params.method, 'DELETE')
      }
      return {
        statusCode: 200,
        body: {
          _scroll_id: 'id',
          count,
          hits: {
            hits: count === 4
              ? []
              : [
                  { _source: { one: 'one' } },
                  { _source: { two: 'two' } },
                  { _source: { three: 'three' } }
                ]
          }
        }
      }
    }
  })

  const client = new Client({
    node: 'http://localhost:9200',
    Connection: MockConnection
  })

  const scrollSearch = client.helpers.scrollSearch({
    index: 'test',
    query: { match_all: {} }
  }, {
    wait: 10
  })

  for await (const result of scrollSearch) {
    // @ts-expect-error
    t.equal(result.body.count, count)
    // @ts-expect-error
    t.not(result.body.count, 1)
    t.equal(result.body._scroll_id, 'id')
  }
})

test('Scroll search (retry throws and maxRetries)', async t => {
  const maxRetries = 5
  const expectedAttempts = maxRetries + 1
  let count = 0
  const MockConnection = connection.buildMockConnection({
    onRequest (_params) {
      count += 1
      return { body: {}, statusCode: 429 }
    }
  })

  const client = new Client({
    node: 'http://localhost:9200',
    Connection: MockConnection,
    maxRetries
  })

  const scrollSearch = client.helpers.scrollSearch({
    index: 'test',
    query: { match_all: {} }
  }, {
    wait: 10,
    ignore: [404]
  })

  try {
    for await (const _result of scrollSearch) { // eslint-disable-line
      t.fail('we should not be here')
    }
  } catch (err: any) {
    t.ok(err instanceof errors.ResponseError)
    t.equal(err.statusCode, 429)
    t.equal(count, expectedAttempts)
  }
})

test('Scroll search (retry throws later)', async t => {
  const maxRetries = 5
  const expectedAttempts = maxRetries + 2
  let count = 0
  const MockConnection = connection.buildMockConnection({
    onRequest (params) {
      count += 1
      // filter_path should not be added if is not already present
      if (params.method === 'POST') {
        if (params.path === '/test/_search') {
          t.equal(params.querystring, 'scroll=1m')
        } else {
          // @ts-expect-error
          t.equal(JSON.parse(params.body).scroll, '1m')
        }
      }
      if (count > 1) {
        return { body: {}, statusCode: 429 }
      }
      return {
        statusCode: 200,
        body: {
          _scroll_id: 'id',
          count,
          hits: {
            hits: [
              { _source: { one: 'one' } },
              { _source: { two: 'two' } },
              { _source: { three: 'three' } }
            ]
          }
        }
      }
    }
  })

  const client = new Client({
    node: 'http://localhost:9200',
    Connection: MockConnection,
    maxRetries
  })

  const scrollSearch = client.helpers.scrollSearch({
    index: 'test',
    query: { match_all: {} }
  }, {
    wait: 10
  })

  try {
    for await (const result of scrollSearch) { // eslint-disable-line
      // @ts-expect-error
      t.equal(result.body.count, count)
    }
  } catch (err: any) {
    t.ok(err instanceof errors.ResponseError)
    t.equal(err.statusCode, 429)
    t.equal(count, expectedAttempts)
  }
})

test('Scroll search documents', async t => {
  let count = 0
  const MockConnection = connection.buildMockConnection({
    onRequest (params) {
      if (count === 0) {
        t.equal(params.querystring, 'filter_path=hits.hits._source%2C_scroll_id&scroll=1m')
      } else {
        if (params.method !== 'DELETE') {
          t.equal(params.body, '{"scroll":"1m","scroll_id":"id"}')
        }
      }
      return {
        body: {
          _scroll_id: 'id',
          count,
          hits: {
            hits: count === 3
              ? []
              : [
                  { _source: { val: 1 * count } },
                  { _source: { val: 2 * count } },
                  { _source: { val: 3 * count } }
                ]
          }
        }
      }
    }
  })

  const client = new Client({
    node: 'http://localhost:9200',
    Connection: MockConnection
  })

  const scrollSearch = client.helpers.scrollDocuments({
    index: 'test',
    query: { match_all: {} }
  })

  let n = 1
  for await (const hit of scrollSearch) {
    t.same(hit, { val: n * count })
    n += 1
    if (n === 4) {
      count += 1
      n = 1
    }
  }
})

test('Should not retry if maxRetries = 0', async t => {
  const maxRetries = 0
  const expectedAttempts = 1
  let count = 0
  const MockConnection = connection.buildMockConnection({
    onRequest (_params) {
      count += 1
      return { body: {}, statusCode: 429 }
    }
  })

  const client = new Client({
    node: 'http://localhost:9200',
    Connection: MockConnection,
    maxRetries
  })

  const scrollSearch = client.helpers.scrollSearch({
    index: 'test',
    query: { match_all: {} }
  }, {
    wait: 10,
    ignore: [404]
  })

  try {
    for await (const _result of scrollSearch) { // eslint-disable-line
      t.fail('we should not be here')
    }
  } catch (err: any) {
    t.ok(err instanceof errors.ResponseError)
    t.equal(err.statusCode, 429)
    t.equal(count, expectedAttempts)
  }
})

test('Fix querystring for scroll search', async t => {
  let count = 0
  const MockConnection = connection.buildMockConnection({
    onRequest (params) {
      if (count === 0) {
        t.equal(params.querystring, 'scroll=1m')
      } else {
        if (params.method !== 'DELETE') {
          if (params.method === 'POST') {
            if (params.path === '/test/_search') {
              t.equal(params.querystring, 'scroll=1m')
            } else {
              // @ts-expect-error
              t.equal(JSON.parse(params.body).scroll, '1m')
            }
          }
        }
      }
      return {
        body: {
          _scroll_id: 'id',
          hits: {
            hits: count === 3
              ? []
              : [
                  { _source: { val: count } }
                ]
          }
        }
      }
    }
  })

  const client = new Client({
    node: 'http://localhost:9200',
    Connection: MockConnection
  })

  const scrollSearch = client.helpers.scrollSearch({
    index: 'test',
    size: 1,
    query: { match_all: {} }
  })

  for await (const response of scrollSearch) {
    t.equal(response.body.hits.hits.length, 1)
    count += 1
  }
})
