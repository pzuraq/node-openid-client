let encode, decodeJSON;

const fromBase64 = (base64) => base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

encode = (input) => {
  if (typeof input === 'object') {
    input = String.fromCharCode(...input);
  }
  return fromBase64(btoa(input));
};
decodeJSON = (input) => JSON.parse(atob(input));

module.exports.decodeJSON = decodeJSON;
module.exports.encode = encode;
