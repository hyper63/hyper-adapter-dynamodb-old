const {
  always,
  merge,
  omit,
  prop,
  map,
  identity,
  sort,
  flip
} = require("ramda");
const { Async } = require("crocks");
const updateExpBuilder = require("./utils/updateExpBuilder.js");
const genHashId = require("./utils/genHash.js");
const idSplit = require("./utils/idSplit.js");

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
const notOkDb = error => ({ ok: false, error });
const notOkDoc = id => error => ({ ok: false, id, error });

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
      .bimap(notOkDb, ok)
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

    function deleteTable(p) {
      return dynamoDb.deleteTable(p).promise();
    }

    return Async.fromPromise(deleteTable)(params)
      .bimap(notOkDb, ok)
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

    const ok = always({
      ok: true,
      id
    });

    return Async.fromPromise(put)(params)
      .bimap(notOkDoc(id), ok)
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

    const ok = doc => ({
      ok: true,
      id,
      doc
    });
    return Async.fromPromise(update)(params)
      .bimap(notOkDoc(id), ok)
      .toPromise();
  }
  /**
   * @param {RetrieveDocumentArgs}
   * @returns {Promise<any>}
   */
  //current impl, sends back ok:true regardless if doc exists
  function removeDocument({ db, id }) {
    const params = {
      TableName: db,
      Key: { hyperHashedId: genHashId(id) }
    };

    const ok = always({ ok: true, id });

    function del(p) {
      return docClient.delete(p).promise();
    }

    return Async.fromPromise(del)(params)
      .bimap(notOkDoc(id), ok)
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
      .bimap(notOkDb, ok)
      .toPromise();
  }

  /**
   *
   * @param {ListDocumentArgs}
   * @returns {Promise<any>}
   */
  //right now, it appears the adapter can't get the value for desc.
  //The port throws a zod error about desc needing to be a boolean, when it must be a string in the qs
  //Docs do not give guidance here
  //this fn needs tests
  const listDocuments = ({ db, limit, startkey, endkey, keys, descending }) => {
    const getId = obj => ({ ...obj, id: idSplit(obj.hyperHashedId) });
    const grabIds = map(getId);
    const omitHashes = map(omit(["hyperHashedId"]));

    const comparator = (a, b) => a.id - b.id;
    const hyperSort = descending ? sort(flip(comparator)) : sort(comparator);

    if (db && !startkey && !endkey && !keys) {
      const params = {
        TableName: db,
        ...(limit && { Limit: Number(limit) })
      };
      function scan(p) {
        return docClient.scan(p).promise();
      }
      return Async.fromPromise(scan)(params)
        .bimap(notOkDb, identity)
        .map(prop("Items"))
        .map(grabIds)
        .map(omitHashes)
        .map(hyperSort) //verify this works
        .map(docs => ({ ok: true, docs }))
        .toPromise();
    }

    //if startkey and endkey, gen id arr, reduce to arr of hashes, then map thru params
    //add limit if necessary
    //add desc if necessary

    //if keys, reduce to arr of hashes, then map thru params
    //add limit if necessary
    //add desc if necessary
  };
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
