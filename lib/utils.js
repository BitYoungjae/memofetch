const isEmptyObj = obj => JSON.stringify(obj) === '{}';
const normalizeString = str => str.trim().toUpperCase();
const isEqualStr = (first, second) =>
  normalizeString(first) === normalizeString(second);

export { isEmptyObj, normalizeString, isEqualStr };
