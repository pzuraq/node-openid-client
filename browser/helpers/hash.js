let hash;

const algMapping = {
  sha256: 'SHA-256',
  sha384: 'SHA-384',
  sha512: 'SHA-512',
};

const encoder = new TextEncoder();

hash = async (type, value) => {
  const hashedValue = await crypto.subtle.digest(algMapping[type], encoder.encode(value));
  return new Uint8Array(hashedValue);
};

module.exports = hash;
