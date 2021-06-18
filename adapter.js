const { always } = require("ramda");
const { Async } = require("crocks");

/**
 * @typedef {Object} DynamoAdapterConfig
 * @property {import('aws-sdk').DynamoDB} ddb
 * @property {module:aws-sdk~DynamoDB} foo
 *
 * @typedef {Object} CreateDocumentArgs
 * @property {string} db
 * @property {string} id
 * @property {object} doc
 *
 * @typedef {Object} RetrieveDocumentArgs
 * @property {string} db
 * @property {string} id
 *
 * @typedef {Object} QueryDocumentsArgs
 * @property {string} db
 * @property {QueryArgs} query
 *
 * @typedef {Object} QueryArgs
 * @property {object} selector
 * @property {string[]} fields
 * @property {number} limit
 * @property {object[]} sort
 * @property {string} use_index
 *
 * @typedef {Object} IndexDocumentArgs
 * @property {string} db
 * @property {string} name
 * @property {string[]} fields
 *
 * @typedef {Object} ListDocumentArgs
 * @property {string} db
 * @property {number} limit
 * @property {string} startkey
 * @property {string} endkey
 * @property {string[]} keys
 *
 * @typedef {Object} BulkDocumentsArgs
 * @property {string} db
 * @property {object[]} docs // TODO: type this better
 *
 * // TODO: add return types
 */

/**
 * Adapter Factory
 *
 * @param {DynamoAdapterConfig} args
 * @returns the Data adapter for DynamoDb
 */
const p = o => new Promise(res => res(o));

module.exports = function({ ddb }) {
  const { docClient, dynamoDb } = ddb; //docClient for simple doc CRUD

  /**
   * @param {string} name
   * @returns {Promise<any>}
   */
  function createDatabase(name) {
    const params = {
      AttributeDefinitions: [
        {
          AttributeName: "partition",
          AttributeType: "S"
        }
      ],
      KeySchema: [
        {
          AttributeName: "partition",
          KeyType: "HASH"
        }
      ],
      TableName: name,
      BillingMode: "PAY_PER_REQUEST"
    };
    return dynamoDb
      .createTable(params)
      .promise()
      .then(doc => ({ ok: true, doc }))
      .catch(e => ({ ok: false, e }));
  }
  /**
   * @param {string} name
   * @returns {Promise<any>}
   */
  function removeDatabase(name) {
    const params = {
      TableName: name
    };
    return dynamoDb
      .deleteTable(params)
      .promise()
      .then(doc => ({ ok: true, doc }))
      .catch(e => ({ ok: false, e }));
  }

  /**
   * @param {CreateDocumentArgs}
   * @returns {Promise<any>}
   */
  function createDocument({ db, id, doc }) {}

  /**
   * @param {RetrieveDocumentArgs}
   * @returns {Promise<any>}
   */
  function retrieveDocument({ db, id }) {}

  /**
   * @param {CreateDocumentArgs}
   * @returns {Promise<any>}
   */
  function updateDocument({ db, id, doc }) {}

  /**
   * @param {RetrieveDocumentArgs}
   * @returns {Promise<any>}
   */
  function removeDocument({ db, id }) {}

  /**
   * @param {QueryDocumentsArgs}
   * @returns {Promise<any>}
   */
  const queryDocuments = ({ db, query }) => p({ ok: true, docs: ["good"] });

  /**
   *
   * @param {IndexDocumentArgs}
   * @returns {Promise<any>}
   */
  function indexDocuments({ db, name, fields }) {}

  /**
   *
   * @param {ListDocumentArgs}
   * @returns {Promise<any>}
   */
  const listDocuments = ({ db, limit, startkey, endkey, keys, descending }) =>
    p({ ok: true, docs: ["cool"] });
  /**
   *
   * @param {BulkDocumentsArgs}
   * @returns {Promise<any>}
   */
  const bulkDocuments = ({ db, docs }) =>
    p({
      ok: true,
      results: [{ ok: true, id: 5 }]
    });

  return Object.freeze({
    createDatabase,
    removeDatabase,
    createDocument,
    retrieveDocument,
    updateDocument,
    removeDocument,
    queryDocuments,
    indexDocuments,
    listDocuments,
    bulkDocuments
  });
};
