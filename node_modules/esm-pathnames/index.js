import { fileURLToPath } from 'url';
import { dirname } from 'path';

const getPathNames = meta => {
  const __filename = fileURLToPath(meta.url);
  const __dirname = dirname(__filename);

  return {
    __filename,
    __dirname,
  };
};

export { getPathNames };
