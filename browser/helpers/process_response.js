const { OPError } = require('../errors');
const parseWwwAuthenticate = require('./www_authenticate_parser');
const STATUS_CODES = require('./status_codes');

const throwAuthenticateErrors = (response) => {
  const params = parseWwwAuthenticate(response.headers.get('www-authenticate'));

  if (params.error) {
    throw new OPError(params, response);
  }
};

const isStandardBodyError = (response) => {
  let result = false;
  try {
    let jsonbody;
    if (typeof response.parsedBody === 'string') {
      jsonbody = JSON.parse(response.parsedBody);
    } else {
      jsonbody = response.parsedBody;
    }
    result = typeof jsonbody.error === 'string' && jsonbody.error.length;
    if (result)
      Object.defineProperty(response, 'parsedBody', { value: jsonbody, configurable: true });
  } catch (err) {}

  return result;
};

function processResponse(response, { statusCode = 200, body = true, bearer = false } = {}) {
  if (response.status !== statusCode) {
    if (bearer) {
      throwAuthenticateErrors(response);
    }

    if (isStandardBodyError(response)) {
      throw new OPError(response.parsedBody, response);
    }

    throw new OPError(
      {
        error: `expected ${statusCode} ${STATUS_CODES[statusCode]}, got: ${response.status} ${
          STATUS_CODES[response.status]
        }`,
      },
      response,
    );
  }

  if (body && !response.parsedBody) {
    throw new OPError(
      {
        error: `expected ${statusCode} ${STATUS_CODES[statusCode]} with body but no body was returned`,
      },
      response,
    );
  }

  return response.parsedBody;
}

module.exports = processResponse;
