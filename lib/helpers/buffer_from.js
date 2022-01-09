let bufferFrom;

if (typeof Buffer !== 'undefined') {
  bufferFrom = Buffer.from;
} else {
  const encoder = new TextEncoder();
  bufferFrom = (str) => encoder.encode(str);
}

module.exports = bufferFrom;
