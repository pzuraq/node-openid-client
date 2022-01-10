const fetchRequest = typeof fetch !== 'undefined' ? fetch : require('cross-fetch');

const LRU = require('lru-cache');

const pkg = require('../../package.json');
const { RPError } = require('../errors');

const pick = require('./pick');
const { deep: defaultsDeep } = require('./defaults');
const { HTTP_OPTIONS } = require('./consts');

let DEFAULT_HTTP_OPTIONS;
const NQCHAR = /^[\x21\x23-\x5B\x5D-\x7E]+$/;

const allowed = [
  'agent',
  'ca',
  'cert',
  'crl',
  'headers',
  'key',
  'lookup',
  'passphrase',
  'pfx',
  'timeout',
];

const setDefaults = (props, options) => {
  DEFAULT_HTTP_OPTIONS = defaultsDeep(
    {},
    props.length ? pick(options, ...props) : options,
    DEFAULT_HTTP_OPTIONS,
  );
};

setDefaults([], {
  headers: { 'User-Agent': `${pkg.name}/${pkg.version} (${pkg.homepage})` },
  timeout: 3500,
});

const nonces = new LRU({ max: 100 });

module.exports = async function request(options, { accessToken, mTLS = false, DPoP } = {}) {
  if (mTLS) {
    // TODO: Use `node-fetch`'s custom `agent` field to pass an
    // HTTPS agent to fetch in Node only
    throw new Error('mTLS is only supported in Node environments');
  }

  if (DPoP) {
    // TODO: Figure out private key stuff using web crypto
    throw new Error('DPoP is not currently supported in non-Node environments');
  }

  let url = new URL(options.url);

  if (!/^(https?:)$/.test(url.protocol)) {
    throw new TypeError('only valid http/https URLs can be requested');
  }

  const optsFn = this[HTTP_OPTIONS];
  let opts = options;

  const nonceKey = `${url.origin}${url.pathname}`;

  let userOptions;
  if (optsFn) {
    userOptions = pick(
      optsFn.call(this, url, defaultsDeep({}, opts, DEFAULT_HTTP_OPTIONS)),
      ...allowed,
    );
  }
  opts = defaultsDeep({}, userOptions, opts, DEFAULT_HTTP_OPTIONS);

  if (opts.searchParams) {
    for (const [key, value] of Object.entries(opts.searchParams)) {
      url.searchParams.delete(key);
      url.searchParams.set(key, value);
    }
  }

  let responseType;
  let form;
  let json;
  let body;
  let timeout;
  ({ form, responseType, json, body, timeout, ...opts } = opts);

  opts.headers = opts.headers || {};

  for (const [key, value] of Object.entries(opts.headers)) {
    if (value === undefined) {
      delete opts.headers[key];
    }
  }

  if (json) {
    opts.headers['content-type'] = 'application/json';
    body = JSON.stringify(json);
  } else if (form) {
    opts.headers['content-type'] = 'application/x-www-form-urlencoded';
    body = new URLSearchParams(form).toString();
  }

  if (body) {
    opts.headers['content-length'] = body.length;
    opts.body = body;
  }

  let response;
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    opts.signal = controller.signal;
    response = await fetchRequest(url, opts);
    clearTimeout(id);

    if (responseType === 'json') {
      response.parsedBody = await response.json();
    } else if (responseType === 'string') {
      response.parsedBody = await response.text();
    } else if (responseType) {
      throw new TypeError('unsupported responseType request option');
    }

    return response;
  } catch (err) {
    if (err.name === 'AbortError') {
      err = new RPError(`outgoing request timed out after ${opts.timeout}ms`);
    }

    if (response) Object.defineProperty(err, 'response', { value: response });
    throw err;
  } finally {
    const dpopNonce = response && response.headers.get('dpop-nonce');
    if (dpopNonce && NQCHAR.test(dpopNonce)) {
      nonces.set(nonceKey, dpopNonce);
    }
  }
};

module.exports.setDefaults = setDefaults.bind(undefined, allowed);
