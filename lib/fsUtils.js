import { promises } from 'fs';
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

export { getJSON, setJSON };
