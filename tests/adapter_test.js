// const test = require('tape')

// const createAdapter = require('./adapter')

// const adapter = createAdapter({
//   ddb: {} // TODO: mock aws-sdk.DynamoDb
// })

// test('bulk documents', async t => {
//   const result = await adapter.bulkDocuments({
//     db: 'hello',
//     docs: [{ id: '1' }, { id: '2' }]
//   }).catch(err => ({ ok: false, err }))
//   t.ok(result.ok)
//   t.equal(result.results.length, 2)
//   t.end()
// })

// test('create database', async t => {
//   const result = await adapter.createDatabase('hello')
//   t.ok(result.ok)
//   t.end()
// })

// test('remove database', async t => {
//   const result = await adapter.removeDatabase('hello')
//   t.ok(result.ok)
//   t.end()
// })

// test('create document', async t => {
//   const result = await adapter.createDocument({
//     db: 'hello', id: '1', doc: { hello: 'world' }
//   })
//   t.ok(result.ok)
//   t.end()
// })

// test('can not create design document', async t => {
//   try {
//     await adapter.createDocument({
//       db: 'hello', id: '_design/1', doc: { hello: 'world' }
//     })
//   } catch (e) {
//     t.ok(!e.ok)
//     t.end()
//   }
// })

// test('retrieve document', async t => {
//   const result = await adapter.retrieveDocument({
//     db: 'hello',
//     id: '1'
//   })
//   t.equal(result.hello, 'world')
//   t.end()
// })

// test('find documents', async t => {
//   const results = await adapter.queryDocuments({
//     db: 'hello',
//     query: {
//       selector: {
//         id: '1'
//       }
//     }
//   })
//   t.deepEqual(results.docs[0], {
//     id: '1',
//     hello: 'world'
//   })
//   t.end()
// })

// test('create query index', async t => {
//   const results = await adapter.indexDocuments({
//     db: 'hello',
//     name: 'foo',
//     fields: ['foo']
//   })
//   t.ok(results.ok)
//   t.end()
// })

// test('list documents', async t => {
//   const results = await adapter.listDocuments({
//     db: 'hello',
//     limit: 1
//   })
//   t.deepEqual(results.docs[0], {
//     id: '1',
//     hello: 'world'
//   })
// })
