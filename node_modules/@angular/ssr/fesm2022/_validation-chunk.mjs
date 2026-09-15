const TRUST_ALL_PROXY_HEADERS = '*';
const HOST_HEADERS_TO_VALIDATE = ['host', 'x-forwarded-host'];
const VALID_PORT_REGEX = /^\d+$/;
const VALID_PROTO_REGEX = /^https?$/i;
const VALID_PREFIX_REGEX = /^\/([a-z0-9_-]+\/)*[a-z0-9_-]*$/i;
function getFirstHeaderValue(value) {
  return value?.toString().split(',', 1)[0]?.trim();
}
function validateRequest(request, allowedHosts, disableHostCheck) {
  validateHeaders(request, allowedHosts, disableHostCheck);
  if (!disableHostCheck) {
    validateUrl(new URL(request.url), allowedHosts);
  }
}
function validateUrl(url, allowedHosts) {
  const {
    hostname
  } = url;
  if (!isHostAllowed(hostname, allowedHosts)) {
    throw new Error(`URL with hostname "${hostname}" is not allowed.`);
  }
}
function sanitizeRequestHeaders(request, trustProxyHeaders) {
  let headersDeleted = false;
  const headers = new Headers();
  for (const [key, value] of request.headers) {
    const lowerKey = key.toLowerCase();
    const isProxyHeader = lowerKey === 'forwarded' || lowerKey.startsWith('x-forwarded-');
    if (isProxyHeader && !isProxyHeaderAllowed(lowerKey, trustProxyHeaders)) {
      console.warn(`Received "${key}" header but "trustProxyHeaders" was not set up to allow it.\n` + `For more information, see https://angular.dev/best-practices/security#configuring-trusted-proxy-headers`);
      headersDeleted = true;
    } else {
      headers.set(key, value);
    }
  }
  return headersDeleted ? new Request(request, {
    headers
  }) : request;
}
function verifyHostAllowed(headerName, headerValue, allowedHosts) {
  const url = `http://${headerValue}`;
  if (!URL.canParse(url)) {
    throw new Error(`Header "${headerName}" contains an invalid value and cannot be parsed.`);
  }
  const {
    hostname,
    pathname,
    search,
    hash,
    username,
    password
  } = new URL(url);
  if (pathname !== '/' || search || hash || username || password) {
    throw new Error(`Header "${headerName}" with value "${headerValue}" contains characters that are not allowed.`);
  }
  if (!isHostAllowed(hostname, allowedHosts)) {
    throw new Error(`Header "${headerName}" with value "${headerValue}" is not allowed.`);
  }
}
function isHostAllowed(hostname, allowedHosts) {
  if (allowedHosts.has('*') || allowedHosts.has(hostname)) {
    return true;
  }
  for (const allowedHost of allowedHosts) {
    if (!allowedHost.startsWith('*.')) {
      continue;
    }
    const domain = allowedHost.slice(1);
    if (hostname.endsWith(domain)) {
      return true;
    }
  }
  return false;
}
function validateHeaders(request, allowedHosts, disableHostCheck) {
  const headers = request.headers;
  for (const headerName of HOST_HEADERS_TO_VALIDATE) {
    const headerValue = getFirstHeaderValue(headers.get(headerName));
    if (headerValue && !disableHostCheck) {
      verifyHostAllowed(headerName, headerValue, allowedHosts);
    }
  }
  const forwarded = headers.get('forwarded');
  if (forwarded) {
    const forwardedParams = parseForwardedHeader(forwarded);
    if (forwardedParams.host && !disableHostCheck) {
      verifyHostAllowed('Forwarded "host"', forwardedParams.host, allowedHosts);
    }
    if (forwardedParams.proto && !VALID_PROTO_REGEX.test(forwardedParams.proto)) {
      throw new Error('Header "forwarded" proto parameter must be either "http" or "https".');
    }
  }
  const xForwardedPort = getFirstHeaderValue(headers.get('x-forwarded-port'));
  if (xForwardedPort && !VALID_PORT_REGEX.test(xForwardedPort)) {
    throw new Error('Header "x-forwarded-port" must be a numeric value.');
  }
  const xForwardedProto = getFirstHeaderValue(headers.get('x-forwarded-proto'));
  if (xForwardedProto && !VALID_PROTO_REGEX.test(xForwardedProto)) {
    throw new Error('Header "x-forwarded-proto" must be either "http" or "https".');
  }
  const xForwardedPrefix = getFirstHeaderValue(headers.get('x-forwarded-prefix'));
  if (xForwardedPrefix && !VALID_PREFIX_REGEX.test(xForwardedPrefix)) {
    throw new Error('Header "x-forwarded-prefix" is invalid. It must start with a "/" and contain ' + 'only alphanumeric characters, hyphens, and underscores, separated by single slashes.');
  }
}
function isProxyHeaderAllowed(headerName, trustProxyHeaders) {
  return trustProxyHeaders.has(TRUST_ALL_PROXY_HEADERS) || trustProxyHeaders.has(headerName.toLowerCase());
}
function normalizeTrustProxyHeaders(trustProxyHeaders) {
  if (!trustProxyHeaders) {
    return new Set();
  }
  if (trustProxyHeaders === true) {
    return new Set([TRUST_ALL_PROXY_HEADERS]);
  }
  const normalizedTrustedProxyHeaders = new Set();
  for (const header of trustProxyHeaders) {
    const lowerHeader = header.toLowerCase();
    if (lowerHeader === TRUST_ALL_PROXY_HEADERS) {
      throw new Error(`"${TRUST_ALL_PROXY_HEADERS}" is not allowed as a value for the "trustProxyHeaders" option.`);
    }
    const isValid = lowerHeader === 'forwarded' || lowerHeader.startsWith('x-forwarded-');
    if (!isValid) {
      throw new Error(`"${header}" is not a valid proxy header. Trusted proxy headers must be "forwarded" or start with "x-forwarded-".`);
    }
    normalizedTrustedProxyHeaders.add(lowerHeader);
  }
  return normalizedTrustedProxyHeaders;
}
function parseForwardedHeader(headerValue) {
  if (!headerValue) {
    return {};
  }
  const params = {};
  let inQuotes = false;
  let escaped = false;
  let currentKey = '';
  let currentValue = '';
  let isParsingValue = false;
  let isKeyEnded = false;
  let isParsingValueEnded = false;
  for (const char of headerValue) {
    if (escaped) {
      escaped = false;
      if (isParsingValue) {
        currentValue += char;
      } else {
        currentKey += char;
      }
      continue;
    }
    if (char === '\\') {
      if (inQuotes) {
        escaped = true;
      } else if (isParsingValue) {
        currentValue += char;
      } else {
        currentKey += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (inQuotes) {
      if (isParsingValue) {
        currentValue += char;
      } else {
        currentKey += char;
      }
      continue;
    }
    if (char === ',') {
      addParam(currentKey, currentValue, isParsingValue, params);
      break;
    }
    if (char === ';') {
      addParam(currentKey, currentValue, isParsingValue, params);
      currentKey = '';
      currentValue = '';
      isParsingValue = false;
      isKeyEnded = false;
      isParsingValueEnded = false;
      continue;
    }
    if (char === '=') {
      if (!isParsingValue) {
        isParsingValue = true;
      } else {
        currentValue += char;
      }
      continue;
    }
    if (char === ' ' || char === '\t') {
      if (isParsingValue) {
        if (currentValue.length > 0) {
          isParsingValueEnded = true;
        }
      } else if (currentKey.length > 0) {
        isKeyEnded = true;
      }
      continue;
    }
    if (isParsingValue) {
      if (!isParsingValueEnded) {
        currentValue += char;
      }
    } else if (isKeyEnded) {
      currentKey = char;
      isKeyEnded = false;
    } else {
      currentKey += char;
    }
  }
  if (currentKey || currentValue || isParsingValue) {
    addParam(currentKey, currentValue, isParsingValue, params);
  }
  return params;
}
function addParam(key, value, hasValue, params) {
  if (!hasValue) {
    return;
  }
  const trimmedKey = key.trim().toLowerCase();
  if (trimmedKey) {
    params[trimmedKey] = value;
  }
}

export { getFirstHeaderValue, isProxyHeaderAllowed, normalizeTrustProxyHeaders, parseForwardedHeader, sanitizeRequestHeaders, validateRequest, validateUrl };
//# sourceMappingURL=_validation-chunk.mjs.map
