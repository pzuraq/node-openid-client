let serialize, deserialize;

try {
  ({ serialize, deserialize } = require('v8'));
} catch (e) {
  serialize = JSON.stringify;
  deserialize = JSON.parse;
}

module.exports = globalThis.structuredClone || ((obj) => deserialize(serialize(obj)));
