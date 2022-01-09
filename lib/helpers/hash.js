let hash;

if (typeof crypto !== 'undefined') {
  const algMapping = {
    sha256: 'SHA-256',
    sha384: 'SHA-384',
    sha512: 'SHA-512',
  };

  const encoder = new TextEncoder("utf-8");

  hash = async (type, value) {
    const hashedValue = await crypto.subtle.digest(algMapping[type], encoder.encode(value));
    return new Uint8Array(hashedValue);
  }
} else {
  const crypto = require('crypto');

  hash = async (type, value) => crypto.createHash(type).update(value).digest();
}

module.exports = hash;
