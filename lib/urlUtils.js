const parseQuery = (query = '') => {
  const result = new Map();
  const params = query.split('&');

  params.forEach(param => {
    const [key, value] = param.split('=');
    result.set(key, value || true);
  });

  return result;
};

export { parseQuery };
