'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var https = _interopDefault(require('https'));
var http = _interopDefault(require('http'));
var url = require('url');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

const { readFile, writeFile } = fs.promises;

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

let memData = null;

process.env = {
  ...process.env,
  memoizationPath: path.resolve('./memoization.json'),
  maxMemo: 10,
  expirationTime: 5000,
};

const getConfigPath = () => process.env.memoizationPath;
const getMaxMemoLength = () => process.env.maxMemo;
const getExpirationTime = () => process.env.expirationTime;
const setConfigPath = url => (process.env.memoizationPath = url);
const setMaxMemo = limit => (process.env.maxMemo = limit);
const setExpirationTime = time => (process.env.expirationTime = time);

/*
 * SHA1 Hash -> Base64 Digest - Fatest Way
 */
const getHash = data => {
  const hash = crypto.createHash('sha1').update(data);
  const digest = hash.digest('base64');

  return digest;
};

const getConfig = async () => {
  if (memData) return memData;
  return await getJSON(getConfigPath());
};

const setConfig = async (key, value) => {
  const prevConfig = await getConfig();
  const newConfig = {
    ...prevConfig,
    [key]: value,
  };

  memData = newConfig;
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
  const newMemo = {
    ...prevMemo,
    [hashKey]: {
      value,
      time,
    },
  };

  await setMemo(newMemo);
};

const useCallback = async (f, key) => {
  const storedValue = await getStoredValue(key);

  if (storedValue) {
    const { time, value } = storedValue;
    const now = Date.now();
    const expTime = getExpirationTime();

    if (now - time >= expTime) return f;

    return resolve => resolve(value);
  }

  return f;
};

const isEmptyObj = obj => JSON.stringify(obj) === '{}';
const normalizeString = str => str.trim().toUpperCase();
const isEqualStr = (first, second) =>
  normalizeString(first) === normalizeString(second);

const memoFetch = async (url$1, options = {}) => {
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

  const parsedURL = url.parse(url$1);

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

  const deps = isEqualStr(method, 'post') ? url$1 + body : url$1;

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

exports.memoFetch = memoFetch;
exports.setConfigPath = setConfigPath;
exports.setExpirationTime = setExpirationTime;
exports.setMaxMemo = setMaxMemo;
