const hash = require('./hash');
const base64url = require('./base64url');

let random;

if (typeof crypto !== 'undefined') {
  random = (bytes = 32) => {
    const arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return base64url.encode(arr);
  };
} else {
  const { randomBytes } = require('crypto');

  random = (bytes = 32) => base64url.encode(randomBytes(bytes));
}

module.exports = {
  random,
  state: random,
  nonce: random,
  codeVerifier: random,
  codeChallenge: async (codeVerifier) => base64url.encode(await hash('sha256', codeVerifier)),
};
