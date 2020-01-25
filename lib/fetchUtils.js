import { getJSON, setJSON } from './fsUtils.js';
import { resolve } from 'path';
import { createHash } from 'crypto';

/*
 * Init Phase
 */
(() => {
  process.env = {
    ...process.env,
    memoizationPath: resolve('./memoization.json'),
    maxMemo: 10,
    expirationTime: 5000,
  };
})();

let memData = null;

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
  const hash = createHash('sha1').update(data);
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

export {
  useCallback,
  storeValue,
  getExpirationTime,
  setExpirationTime,
  setMaxMemo,
  setConfigPath,
};
