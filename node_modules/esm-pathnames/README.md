# ESM-PathNames

You can use `__dirname` and `__filename` when using ESM

## Install

```shell
npm i esm-pathnames
```

## Usage

```js
import { getPathNames } from 'esm-pathnames';

const { __dirname, __filename } = getPathNames(import.meta);
```

## package.json

You have to add the `type` field to `package.json` as shown below.

```json
{
  "name": "package name",
  "version": "0.1.0",
  ...
  "type": "module"
}
```
