const hash = require('./hash');
const base64url = require('./base64url');

let random;

random = (bytes = 32) => {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return base64url.encode(arr);
};

module.exports = {
  random,
  state: random,
  nonce: random,
  codeVerifier: random,
  codeChallenge: async (codeVerifier) => base64url.encode(await hash('sha256', codeVerifier)),
};
