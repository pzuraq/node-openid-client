let encode, decodeJSON;

const fromBase64 = (base64) => base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

if (typeof Buffer !== 'undefined') {
  if (Buffer.isEncoding('base64url')) {
    encode = (input, encoding = 'utf8') => Buffer.from(input, encoding).toString('base64url');
  } else {
    encode = (input, encoding = 'utf8') =>
      fromBase64(Buffer.from(input, encoding).toString('base64'));
  }

  // Decode straight to JSON because in Node we can skip serializing to a string and
  // decode straight from a buffer
  decodeJSON = (input) => JSON.parse(Buffer.from(input, 'base64'));
} else {
  encode = (input) => {
    if (typeof input === 'object') {
      input = String.fromCharCode(...input);
    }
    return fromBase64(btoa(input));
  };
  decodeJSON = (input) => JSON.parse(atob(input));
}

module.exports.decodeJSON = decodeJSON;
module.exports.encode = encode;
