
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
module.exports = function ({ ddb }) {
  /**
   * @param {string} name
   * @returns {Promise<any>}
   */
  function createDatabase (name) {

  }

  /**
   * @param {string} name
   * @returns {Promise<any>}
   */
  function removeDatabase (name) {

  }

  /**
   * @param {CreateDocumentArgs}
   * @returns {Promise<any>}
   */
  function createDocument ({ db, id, doc }) {

  }

  /**
   * @param {RetrieveDocumentArgs}
   * @returns {Promise<any>}
   */
  function retrieveDocument ({ db, id }) {

  }

  /**
   * @param {CreateDocumentArgs}
   * @returns {Promise<any>}
   */
  function updateDocument ({ db, id, doc }) {

  }

  /**
   * @param {RetrieveDocumentArgs}
   * @returns {Promise<any>}
   */
  function removeDocument ({ db, id }) {

  }

  /**
   * @param {QueryDocumentsArgs}
   * @returns {Promise<any>}
   */
  function queryDocuments ({ db, query }) {

  }

  /**
   *
   * @param {IndexDocumentArgs}
   * @returns {Promise<any>}
   */
  function indexDocuments ({ db, name, fields }) {

  }

  /**
   *
   * @param {ListDocumentArgs}
   * @returns {Promise<any>}
   */
  function listDocuments ({ db, limit, startkey, endkey, keys }) {

  }

  /**
   *
   * @param {BulkDocumentsArgs}
   * @returns {Promise<any>}
   */
  function bulkDocuments ({ db, docs }) {

  }

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
  })
}
