const { encode } = require('./base64url');

/** SPECIFICATION
 * Its (_hash) value is the base64url encoding of the left-most half of the hash of the octets of
 * the ASCII representation of the token value, where the hash algorithm used is the hash algorithm
 * used in the alg Header Parameter of the ID Token's JOSE Header. For instance, if the alg is
 * RS256, hash the token value with SHA-256, then take the left-most 128 bits and base64url encode
 * them. The _hash value is a case sensitive string.
 */

/**
 * @name getHash
 * @api private
 *
 * returns the sha length based off the JOSE alg heade value, defaults to sha256
 *
 * @param token {String} token value to generate the hash from
 * @param alg {String} ID Token JOSE header alg value (i.e. RS256, HS384, ES512, PS256)
 * @param [crv] {String} For EdDSA the curve decides what hash algorithm is used. Required for EdDSA
 */
let getHashValue;

const encoder = new TextEncoder();

function getHash(alg, crv) {
  switch (alg) {
    case 'HS256':
    case 'RS256':
    case 'PS256':
    case 'ES256':
    case 'ES256K':
      return 'SHA-256';

    case 'HS384':
    case 'RS384':
    case 'PS384':
    case 'ES384':
      return 'SHA-384';

    case 'HS512':
    case 'RS512':
    case 'PS512':
    case 'ES512':
      return 'SHA-512';

    case 'EdDSA':
      switch (crv) {
        case 'Ed25519':
          return 'SHA-512';
        case 'Ed448':
          throw new TypeError('Ed448 *_hash calculation is not supported in non-Node runtimes');
        default:
          throw new TypeError('unrecognized or invalid EdDSA curve provided');
      }

    default:
      throw new TypeError('unrecognized or invalid JWS algorithm provided');
  }
}

getHashValue = async (alg, crv, token) => {
  const hashedValue = await crypto.subtle.digest(getHash(alg, crv), encoder.encode(token));
  return String.fromCharCode(...new Uint8Array(hashedValue));
};

async function generate(token, alg, crv) {
  const digest = await getHashValue(alg, crv, token);
  return encode(digest.slice(0, digest.length / 2));
}

async function validate(names, actual, source, alg, crv) {
  if (typeof names.claim !== 'string' || !names.claim) {
    throw new TypeError('names.claim must be a non-empty string');
  }

  if (typeof names.source !== 'string' || !names.source) {
    throw new TypeError('names.source must be a non-empty string');
  }

  if (typeof actual !== 'string' && actual)
    throw new Error(`${names.claim} must be a non-empty string`);
  if (typeof source !== 'string' && source)
    throw new Error(`${names.source} must be a non-empty string`);

  let expected;
  let msg;
  try {
    expected = await generate(source, alg, crv);
  } catch (err) {
    msg = `${names.claim} could not be validated (${err.message})`;
  }

  msg = msg || `${names.claim} mismatch, expected ${expected}, got: ${actual}`;

  if (expected !== actual) throw new Error(msg);
}

module.exports = {
  validate,
  generate,
};
