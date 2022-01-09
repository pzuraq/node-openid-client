let encode;

if (typeof Buffer !== 'undefined') {
  encode = (str) => Buffer.from(str).toString('base64');
} else {
  encode = btoa;
}

module.exports.encode = encode;
