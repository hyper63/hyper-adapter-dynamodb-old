const { compose, join, map, addIndex } = require("ramda");
const imap = addIndex(map);

//this fn needs a few tests
module.exports = function(item) {
  const k = i => `#key${i}`;
  const v = i => `:val${i}`;
  const keys = Object.keys(item);
  const assignmentStr = compose(
    join(", "),
    imap((nothingAtAll, i) => `${k(i)} = ${v(i)}`)
  )(keys);

  const updateExp = `SET ${assignmentStr}`; //uses k and v
  const expAttNames = keys.reduce((acc, el, i) => ({ ...acc, [k(i)]: el }), {}); // uses k
  const expAttVals = keys.reduce(
    (acc, el, i) => ({ ...acc, [v(i)]: item[el] }),
    {}
  ); // uses v
  return { updateExp, expAttNames, expAttVals };
};
