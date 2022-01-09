let isKeyObject;

if (typeof crypto !== 'undefined') {
  isKeyObject = (obj) => obj && obj instanceof CryptoKey;
} else {
  const util = require('util');
  const crypto = require('crypto');

  isKeyObject = util.types.isKeyObject || ((obj) => obj && obj instanceof crypto.KeyObject);
}

module.exports = isKeyObject;
