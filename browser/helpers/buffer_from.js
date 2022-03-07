let bufferFrom;

const encoder = new TextEncoder();
bufferFrom = (str) => encoder.encode(str);

module.exports = bufferFrom;
