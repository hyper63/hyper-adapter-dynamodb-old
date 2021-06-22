const test = require("tape");
const AWSMock = require("aws-sdk-mock"); //https://www.npmjs.com/package/aws-sdk-mock
const AWS = require("aws-sdk");

const createAdapter = require("../adapter");

test("create table", async t => {
  AWSMock.setSDKInstance(AWS);
  AWSMock.mock("DynamoDB", "createTable", "Table Created!");
  const adapter = createAdapter({
    ddb: {
      dynamoDb: new AWS.DynamoDB()
    }
  });

  const res = await adapter.createDatabase("wow_db");
  t.deepEqual(res, {
    ok: true,
    doc: "Table Created!"
  });
  t.end();

  AWSMock.restore("DynamoDB");
});

test("remove table", async t => {
  AWSMock.setSDKInstance(AWS);
  AWSMock.mock("DynamoDB", "deleteTable", "Table Deleted!");
  const adapter = createAdapter({
    ddb: {
      dynamoDb: new AWS.DynamoDB()
    }
  });

  const res = await adapter.removeDatabase("wow_db");
  t.deepEqual(res, {
    ok: true,
    doc: "Table Deleted!"
  });
  t.end();
  AWSMock.restore("DynamoDB");
});

test("index documents", async t => {
  AWSMock.setSDKInstance(AWS);
  AWSMock.mock("DynamoDB", "updateTable", "Indexed!");
  const adapter = createAdapter({
    ddb: {
      dynamoDb: new AWS.DynamoDB()
    }
  });
  const input = {
    db: "wow_db",
    name: "wow_db_title-year-idx",
    fields: ["title", "year"]
  };

  const res = await adapter.indexDocuments(input);
  t.deepEqual(res, {
    ok: true,
    doc: "Indexed!"
  });
  t.end();
  AWSMock.restore("DynamoDB");
});
