let isKeyObject;

isKeyObject = (obj) => obj && obj instanceof CryptoKey;

module.exports = isKeyObject;
