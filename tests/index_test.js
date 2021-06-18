// const test = require('tape')
// const dynamoDbAdapterFactory = require('./index')

// const API_VERSION = '2012-08-10'

// test('validate adapter - should exist', t => {
//   const adapter = dynamoDbAdapterFactory({})
//   t.ok(adapter)
//   t.end()
// })

// test('validate load() - should merge configs', t => {
//   const config = {
//     region: 'foo',
//     apiVersion: API_VERSION
//   }
//   const adapter = dynamoDbAdapterFactory(config)

//   const loadedConfig = adapter.load({ fizz: 'buzz' })

//   t.equals(loadedConfig.region, config.region)
//   t.equals(loadedConfig.apiVersion, config.apiVersion)
//   t.equals(loadedConfig.fizz, 'buzz')
//   t.end()
// })

// test('validate load() - should throw on no region', t => {
//   const noRegionConfig = {
//     no_region: 'womp',
//     apiVersion: API_VERSION
//   }

//   const adapter = dynamoDbAdapterFactory(noRegionConfig)

//   t.throws(() => adapter.load(), 'Config region and apiVersion must be provided')
//   t.end()
// })

// test('validate load() - should throw on no apiVersion', t => {
//   const noApiVersionConfig = {
//     region: 'womp',
//     no_apiVersion: 'big womp'
//   }

//   const adapter = dynamoDbAdapterFactory(noApiVersionConfig)

//   t.throws(() => adapter.load(), 'Config region and apiVersion must be provided')
//   t.end()
// })

// test('validate link() - should not throw', t => {
//   const config = {
//     region: 'foo',
//     apiVersion: API_VERSION
//   }

//   const adapter = dynamoDbAdapterFactory(config)
//   t.ok(adapter.link(config)())
//   t.end()
// })
