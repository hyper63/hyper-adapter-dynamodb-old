const { mergeDeepRight, defaultTo, pipe, ifElse, identity } = require("ramda");
const AWS = require("aws-sdk");

const createAdapter = require("./adapter");

/**
 * @typedef {Object} DynamoAdapterPluginConfig
 * @property {string} apiVersion - the aws api version to use
 * @property {string} region - the aws region to use
 * @property {string} accessKeyId - the IAM user's access key id
 * @property {string} secretAccessKey - the IAM user's secret access key
 */

/**
 * @param {DynamoAdapterPluginConfig} config
 * @returns {object}
 */
module.exports = function DynamoDataAdapter(config) {
  const { accessKeyId, secretAccessKey, region, apiVersion } = config;

  return Object.freeze({
    id: "dynamodb-data-adapter",
    port: "data",
    /**
     * The load function that returns the config object
     * that is then passed to the link function. For now, just a passthrough
     *
     * @returns {DynamoAdapterPluginConfig} - the top level config
     */
    load: pipe(
      defaultTo({}),
      mergeDeepRight({ ...config, apiVersion: apiVersion || "2012-08-10" }),
      ifElse(
        config => region && accessKeyId && secretAccessKey,
        identity,
        () => {
          throw new Error(
            "Config region and access key id and access secret must be provided"
          );
        }
      )
    ),
    /**
     * The link function that returns the adapter instance
     *
     * @param {DynamoAdapterPluginConfig} env
     * @returns the adapter
     */
    link: env => _ => {
      const docClient = new AWS.DynamoDB.DocumentClient({
        accessKeyId,
        secretAccessKey,
        region,
        apiVersion: apiVersion || "2012-08-10"
      });
      const dynamoDb = new AWS.DynamoDB({
        accessKeyId,
        secretAccessKey,
        region,
        apiVersion: apiVersion || "2012-08-10"
      });
      const ddb = { docClient, dynamoDb };
      return createAdapter({ ddb });
    }
  });
};
