
const { mergeDeepRight, defaultTo, pipe, ifElse, identity } = require('ramda')
const AWS = require('aws-sdk')

const createAdapter = require('./adapter')


/**
  * @typedef {Object} DynamoAdapterPluginConfig
  * @property {string} apiVersion - the aws api version to use
  * @property {string} region - the aws region to use
 */

/**
 * @param {DynamoAdapterPluginConfig} config
 * @returns {object}
 */
module.exports = function DynamoDataAdapter (config) {
  return Object.freeze({
    id: 'dynamodb-data-adapter',
    port: 'data',
    /**
     * The load function that returns the config object
     * that is then passed to the link function. For now, just a passthrough
     *
     * @returns {DynamoAdapterPluginConfig} - the top level config
     */
    load: pipe(
      defaultTo({}),
      mergeDeepRight(config),
      ifElse(
        config => config.region && config.apiVersion,
        identity,
        () => { throw new Error('Config region and apiVersion must be provided') }
      )
    ),
    /**
     * The link function that returns the adapter instance
     *
     * @param {DynamoAdapterPluginConfig} env 
     * @returns the adapter
     */
    link: env => _ => {
      AWS.config.update(env.region)
      const ddb = new AWS.DynamoDB({ apiVersion: env.apiVersion })

      return createAdapter({ ddb })
    }
  })
}
