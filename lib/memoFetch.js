import https from 'https';
import http from 'http';
import { parse } from 'url';
import { useCallback, storeValue } from './fetchUtils.js';
import { setExpirationTime, setMaxMemo, setConfigPath } from './fetchUtils.js';
import { isEqualStr, isEmptyObj } from './utils.js';

const memoFetch = async (url, options = {}) => {
  const {
    filter = v => v,
    method = 'GET',
    headers = null,
    useMemo = true,
    agent, // undefined => http.globalAgent
  } = options;

  let { body = '' } = options;

  if (typeof body === 'object') {
    body = JSON.stringify(body, null, 2);
  }

  const parsedURL = parse(url);

  const {
    protocol,
    hostname,
    path,
    port = protocol === 'https:' ? 443 : 80,
  } = parsedURL;

  const httpModule = protocol === 'https:' ? https : http;

  const reqOptions = {
    agent,
    method,
    hostname,
    port,
    headers,
    path,
  };

  const deps = isEqualStr(method, 'post') ? url + body : url;

  const executorOrigin = (resolve, reject) => {
    const req = httpModule.request(reqOptions, res => {
      let text = '';
      const resHeaders = res.headers;

      res.setEncoding('utf-8');

      res.on('data', chunk => (text += chunk));
      res.on('end', () => {
        let json = null;

        try {
          json = JSON.parse(text);
        } catch (e) {
          json = {};
        }

        const resolvedValue = {};
        resolvedValue.headers = resHeaders;

        if (isEmptyObj(json)) {
          resolvedValue.type = 'string';
          resolvedValue.data = text;
        } else {
          const filterdData = filter(json);
          resolvedValue.type = 'object';
          resolvedValue.data = filterdData;
        }

        useMemo && storeValue(deps, resolvedValue);
        resolve(resolvedValue);
      });
    });

    req.on('error', err => reject(err));
    req.write(body);
    req.end();
  };

  let executor = executorOrigin;

  if (useMemo) {
    executor = await useCallback(executorOrigin, deps);
  }

  return new Promise(executor);
};

export { memoFetch, setExpirationTime, setMaxMemo, setConfigPath };
