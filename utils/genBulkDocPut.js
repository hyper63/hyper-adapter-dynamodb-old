const { map, omit } = require("ramda");
const genHashId = require("./genHash.js");

const putSchema = doc => ({
  PutRequest: {
    Item: { ...omit(["id"], doc), hyperHashedId: genHashId(doc.id) }
  }
});
module.exports = map(putSchema);
