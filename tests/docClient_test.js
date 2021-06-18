const test = require("tape");
const AWSMock = require("aws-sdk-mock"); //https://www.npmjs.com/package/aws-sdk-mock
const AWS = require("aws-sdk");

const createAdapter = require("../adapter");

/**
 *
 *
 *
 *
 *
 *
 * todo pass on correct responses
 *
 * Match the happy path response status for each sdk response
 *
 * check the shape coming from real sdk response as model
 *
 * */
const sampleDoc = { k1: "v1", k2: [{ k3: "v3" }] };

test("retrieve document", async t => {
  AWSMock.setSDKInstance(AWS);
  AWSMock.mock("DynamoDB.DocumentClient", "get", (params, callback) => {
    callback(null, sampleDoc);
  });

  const input = { db: "hello", id: 160 };
  const adapter = createAdapter({
    ddb: {
      docClient: new AWS.DynamoDB.DocumentClient({})
    }
  });

  const res = await adapter.retrieveDocument(input);
  t.deepEqual(res, {
    ok: true,
    id: input.id,
    doc: sampleDoc
  });
  t.end();
  AWSMock.restore("DynamoDB.DocumentClient");

  // const result = await adapter.retrieveDocument({
  //   db: "hello",
  //   id: "1"
  // });
  // t.equal(result.hello, "world");
});

test("create document and retrieve", async t => {
  AWSMock.setSDKInstance(AWS);
  AWSMock.mock("DynamoDB.DocumentClient", "put", (params, callback) => {
    callback(null, "Happy docClient response");
  });
  AWSMock.mock("DynamoDB.DocumentClient", "get", (params, callback) => {
    callback(null, sampleDoc);
  });

  const input = { db: "hello", id: 160, doc: sampleDoc };
  const adapter = createAdapter({
    ddb: {
      docClient: new AWS.DynamoDB.DocumentClient({})
    }
  });

  const created = await adapter.createDocument(input);
  t.deepEqual(created, {
    ok: true,
    id: input.id
  });
  const read = await adapter.retrieveDocument({
    db: "hello",
    id: created.id
  });
  t.deepEqual(read, {
    ok: true,
    id: input.id,
    doc: sampleDoc
  });
  t.end();
  AWSMock.restore("DynamoDB.DocumentClient");
});

test("create document and update", async t => {
  AWSMock.setSDKInstance(AWS);
  AWSMock.mock("DynamoDB.DocumentClient", "put", (params, callback) => {
    callback(null, "Happy docClient response");
  });
  const oldDoc = { k1: sampleDoc.k1, status: 201 };
  AWSMock.mock("DynamoDB.DocumentClient", "update", (params, callback) => {
    callback(null, oldDoc);
  });

  const input = { db: "hello", id: 160, doc: sampleDoc };
  const adapter = createAdapter({
    ddb: {
      docClient: new AWS.DynamoDB.DocumentClient({})
    }
  });

  const created = await adapter.createDocument(input);
  t.deepEqual(created, {
    ok: true,
    id: input.id
  });
  const updated = await adapter.updateDocument({
    db: "hello",
    id: created.id,
    doc: { k1: "Larry David", k4: "v4" }
  });
  t.deepEqual(updated, {
    ok: true,
    id: input.id,
    doc: oldDoc
  });
  t.end();
  AWSMock.restore("DynamoDB.DocumentClient");
});

test("create document and remove", async t => {
  AWSMock.setSDKInstance(AWS);
  AWSMock.mock("DynamoDB.DocumentClient", "put", (params, callback) => {
    callback(null, "Happy docClient response");
  });

  AWSMock.mock("DynamoDB.DocumentClient", "delete", (params, callback) => {
    callback(null, { status: 200, msg: "Happy Delete response" });
  });

  const input = { db: "hello", id: 160, doc: sampleDoc };
  const adapter = createAdapter({
    ddb: {
      docClient: new AWS.DynamoDB.DocumentClient({})
    }
  });

  const created = await adapter.createDocument(input);
  t.deepEqual(created, {
    ok: true,
    id: input.id
  });

  try {
    const deleted = await adapter.removeDocument({
      db: "hello",
      id: created.id
    });
    console.log("DELETED KEY", deleted);
    t.deepEqual(deleted, {
      ok: true,
      id: input.id
    });
  } catch (error) {
    t.deepEqual(error, {
      ok: false,
      id: input.id
      // error: { status: 200, msg: "Happy Delete response" }
    });
  }
  t.end();
  AWSMock.restore("DynamoDB.DocumentClient");
});
