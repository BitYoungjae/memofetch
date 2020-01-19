import https from 'https';
import http from 'http';
import { parse } from 'url';
import { useCallback, storeValue } from './fetchUtils.js';
import { setExpirationTime, setMaxMemo, setConfigPath } from './fetchUtils.js';

const memoFetch = async (url, options = {}) => {
  const { filter = v => v, method = 'GET', headers = null } = options;
  let { body = '' } = options;

  if (typeof body === 'object') {
    body = JSON.stringify(body, null, 2);
  }

  const parsedURL = parse(url);
  const { protocol, hostname, path } = parsedURL;
  const httpModule = protocol === 'https:' ? https : http;
  let { port } = parsedURL;

  if (!port) {
    port = protocol === 'https:' ? 443 : 80;
  }

  const reqOptions = {
    method,
    hostname,
    port,
    headers,
    path,
  };

  let deps = url;

  if (method === 'POST') {
    deps = url + body;
  }

  const executor = await useCallback((resolve, reject) => {
    const req = httpModule.request(reqOptions, res => {
      let text = '';
      res.setEncoding('utf-8');
      res.on('data', chunk => (text += chunk));
      res.on('end', () => {
        let json = null;

        try {
          json = JSON.parse(text);
        } catch (e) {
          json = {};
        }

        const filterdData = filter(json);

        storeValue(deps, filterdData);
        resolve(filterdData);
      });
    });

    req.on('error', err => reject(err));
    req.write(body);
    req.end();
  }, deps);

  return new Promise(executor);
};

export { memoFetch, setExpirationTime, setMaxMemo, setConfigPath };
