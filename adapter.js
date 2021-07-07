const { always, merge, omit, prop, ifElse, propEq } = require("ramda");
const { Async } = require("crocks");
const updateExpBuilder = require("./utils/updateExpBuilder.js");
const genHashId = require("./utils/genHash.js");

/**
 * @typedef {Object} DynamoAdapterConfig
 * @property {{docClient,dynamoDb}} ddb
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
const ok = doc => ({ ok: true, doc });
const notOk = always({ ok: false });

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
          AttributeName: "hyperHashedId",
          AttributeType: "S"
        }
      ],
      KeySchema: [
        {
          AttributeName: "hyperHashedId",
          KeyType: "HASH"
        }
      ],
      TableName: name,
      BillingMode: "PAY_PER_REQUEST"
    };

    function createTable(p) {
      return dynamoDb.createTable(p).promise();
    }
    return Async.fromPromise(createTable)(params)
      .bimap(notOk, ok)
      .toPromise();
  }
  /**
   * @param {string} name
   * @returns {Promise<any>}
   */
  function removeDatabase(name) {
    const params = {
      TableName: name
    };

    const notOk = error => ({ ok: false, error });

    function deleteTable(p) {
      return dynamoDb.deleteTable(p).promise();
    }

    return Async.fromPromise(deleteTable)(params)
      .bimap(notOk, ok)
      .toPromise();
  }

  /**
   * @param {CreateDocumentArgs}
   * @returns {Promise<any>}
   */
  //Right now this does an Upsert
  //Should this first check for existence?
  function createDocument({ db, id, doc }) {
    if (!db || !id || !doc) return { ok: false };
    const params = {
      TableName: db,
      Item: { ...omit(["id"], doc), hyperHashedId: genHashId(id) }
    };
    function put(p) {
      return docClient.put(p).promise();
    }
    const notOk = error => ({
      ok: false,
      id,
      error
    });
    const ok = always({
      ok: true,
      id
    });

    return Async.fromPromise(put)(params)
      .bimap(notOk, ok)
      .toPromise();
  }
  /**
   * @param {RetrieveDocumentArgs}
   * @returns {Promise<any>}
   */
  async function retrieveDocument({ db, id }) {
    const params = {
      TableName: db,
      Key: {
        hyperHashedId: genHashId(id)
      }
    };
    function get(p) {
      return docClient.get(p).promise();
    }
    return Async.fromPromise(get)(params)
      .map(prop("Item"))
      .map(omit(["hyperHashedId"]))
      .map(doc => ({ id, doc }))
      .map(merge({ ok: true }))
      .toPromise();
  }

  /**
   * @param {CreateDocumentArgs}
   * @returns {Promise<any>}
   */
  //in its current impl, it sends back the old doc
  //if the old doc doesn't exist, it creates the new one and sends back an empty doc
  function updateDocument({ db, id, doc }) {
    console.log("HERE O");
    const { updateExp, expAttNames, expAttVals } = updateExpBuilder(doc);
    const params = {
      TableName: db,
      Key: { hyperHashedId: genHashId(id) },
      UpdateExpression: updateExp,
      ExpressionAttributeNames: expAttNames,
      ExpressionAttributeValues: expAttVals,
      ReturnValues: "UPDATED_OLD"
    };
    function update(p) {
      return docClient.update(p).promise();
    }
    const notOk = error => ({
      ok: false,
      id,
      error
    });
    const ok = doc => ({
      ok: true,
      id,
      doc
    });
    return Async.fromPromise(update)(params)
      .bimap(notOk, ok)
      .map(merge({ id }))
      .toPromise();
  }
  /**
   * @param {RetrieveDocumentArgs}
   * @returns {Promise<any>}
   */
  function removeDocument({ db, id }) {
    const params = {
      TableName: db,
      Key: { hyperHashedId: genHashId(id) }
    };

    const notOk = error => ({
      ok: false,
      id,
      error
    });
    const ok = always({ ok: true, id });
    const exists = res => (!!res ? Async.Resolved : Async.Rejected); //A success comes back as {}

    function del(p) {
      return docClient.delete(p).promise();
    }

    return Async.fromPromise(del)(params)
      .map(exists)
      .bimap(notOk, ok)
      .toPromise();
  }
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

  function indexDocuments({ db, name, fields }) {
    const params = {
      TableName: db,
      AttributeDefinitions: [
        /* required */
        {
          AttributeName: name /* required */,
          AttributeType: "S" /* required */
        }
      ],
      GlobalSecondaryIndexUpdates: [
        {
          Create: {
            IndexName: name /* required */,
            KeySchema: [
              /* required */
              {
                AttributeName: name /* required */,
                KeyType: "HASH" /* required */
              }
              /* more items */
            ],

            Projection: {
              /* required */
              NonKeyAttributes: fields,
              ProjectionType: "INCLUDE" //| KEYS_ONLY | ALL
            },
            ProvisionedThroughput: {
              ReadCapacityUnits: "1" /* required */,
              WriteCapacityUnits: "1" /* required */
            }
          }
        }
        /* more items */
      ]
    };

    function updateTable(p) {
      return dynamoDb.updateTable(p).promise();
    }
    return Async.fromPromise(updateTable)(params)
      .bimap(notOk, ok)
      .toPromise();
  }

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
