const genHash = require("../utils/genHash.js");
const test = require("tape");

test("creates a key of the format id##hashedId", async t => {
  t.equal(genHash("1"), "1##356a192b7913b04c54574d18c28d46e6395428ab");
  t.equal(
    genHash("hello my pal world"),
    "hello my pal world##1e2f57fbdba9bdc57104e82bb19c84b507697229"
  );
  t.end();
});
