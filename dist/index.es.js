process.emitWarning("The .es.js file is deprecated. Use .mjs instead.");

import { promises } from 'fs';
import { resolve } from 'path';
import { createHash } from 'crypto';
import https from 'https';
import http from 'http';
import { parse } from 'url';

const { readFile, writeFile } = promises;

const getJSON = async url => {
  try {
    const text = await readFile(url, { encoding: 'utf-8' });
    const json = JSON.parse(text);

    return json;
  } catch (e) {
    if (e.code == 'ENOENT') return {};
  }
};

const setJSON = async (url, data) => {
  const json = JSON.stringify(data, null, 2);

  await writeFile(url, json);
};

/*
 * Init Phase
 */
(() => {
  const b = {
    memoizationPath: resolve('./memoization.json'),
    maxMemo: 10,
    expirationTime: 5000
  };
  process.env = Object.assign(process.env, b);
})();

const getConfigPath = () => process.env.memoizationPath;
const getMaxMemoLength = () => process.env.maxMemo;
const getExpirationTime = () => process.env.expirationTime;
const setConfigPath = url => process.env.memoizationPath = url;
const setMaxMemo = limit => process.env.maxMemo = limit;
const setExpirationTime = time => process.env.expirationTime = time;

/*
 * SHA1 Hash -> Base64 Digest - Fatest Way
 */
const getHash = data => {
  const hash = createHash('sha1').update(data);
  const digest = hash.digest('base64');

  return digest;
};

const getConfig = async () => await getJSON(getConfigPath());

const setConfig = async (key, value) => {
  const prevConfig = await getConfig();
  const newConfig = Object.assign(prevConfig, {
    [key]: value
  });

  await setJSON(getConfigPath(), newConfig);
};

const getMemo = async () => {
  const { memo } = await getConfig();
  return memo;
};

const setMemo = async memo => {
  let result = memo;
  const maxLen = getMaxMemoLength();
  const length = Object.keys(memo).length;

  if (length > maxLen) result = {};

  await setConfig('memo', result);
};

const getStoredValue = async key => {
  const hashKey = getHash(key);
  const memo = await getMemo();
  return memo && memo[hashKey];
};

const storeValue = async (key, value) => {
  const prevMemo = await getMemo();
  const time = Date.now();
  const hashKey = getHash(key);
  const newMemo = Object.assign(prevMemo, {
    [hashKey]: {
      value,
      time
    }
  });

  await setMemo(newMemo);
};

const useCallback = async (f, key) => {
  const storedValue = await getStoredValue(key);

  if (storedValue) {
    const { time, value } = storedValue;
    const now = Date.now();
    const expTime = getExpirationTime();

    if (now - time >= expTime) return f;

    return resolve$$1 => resolve$$1(value);
  }

  return f;
};

const isEmptyObj = obj => JSON.stringify(obj) === '{}';
const normalizeString = str => str.trim().toUpperCase();
const isEqualStr = (first, second) => normalizeString(first) === normalizeString(second);

const memoFetch = async (url, options = {}) => {
  const {
    filter = v => v,
    method = 'GET',
    headers = null,
    useMemo = true
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
    port = protocol === 'https:' ? 443 : 80
  } = parsedURL;

  const httpModule = protocol === 'https:' ? https : http;

  const reqOptions = {
    method,
    hostname,
    port,
    headers,
    path
  };

  const deps = isEqualStr(method, 'post') ? url + body : url;

  const executorOrigin = (resolve$$1, reject) => {
    const req = httpModule.request(reqOptions, res => {
      let text = '';
      const resHeaders = res.headers;

      res.setEncoding('utf-8');

      res.on('data', chunk => text += chunk);
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
        resolve$$1(resolvedValue);
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
