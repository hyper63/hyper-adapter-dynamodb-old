const crypto = require("crypto");

/**
 * @param {string} id
 * @returns {string}
 * Returns a hyper ddb id of the format:
 * id##sha1(id)
 */
//# is a valid input to the createDoc endpoint, but the sha1 output will always be hex
//So any logic that wants to split the id from its hash should split at the last two ##
const sha1Hex = id =>
  `${id}##${crypto
    .createHash("sha1")
    .update(id)
    .digest("hex")}`;

module.exports = sha1Hex;
