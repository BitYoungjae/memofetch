# memoFetch

fetch API with memoization

## Install

```shell
npm i memofetch
```

## Usage

### GET

```js
import { memoFetch, setExpirationTime, setMaxMemo } from 'memoFetch';

(async () => {
  await setMaxMemo(10);
  await setExpirationTime(5000);

  const { data } = await memoFetch(
    'https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=' +
      encodeURIComponent('양천구'),
    {
      filter: ({ addresses }) => {
        return {
          x: addresses[0].x,
          y: addresses[0].y,
        };
      },
      headers: {
        'X-NCP-APIGW-API-KEY-ID': 'sample',
        'X-NCP-APIGW-API-KEY': 'sample',
      },
    },
  );

  console.log(data);
})();
```

### Save in JSON format

```json
{
  "memo": {
    "gBWWpZc5vilNlknBafd7yqi+nAo=": {
      "value": {
        "headers": {
          // response headers
          "server": "nginx",
          "date": "Sun, 19 Jan 2020 14:24:55 GMT",
          "content-type": "application/json;charset=UTF-8",
          "content-length": "867",
          "connection": "close",
          "x-ncp-trace-id": "36d31ckp3edpj38phnccqmcoph"
        },
        "type": "object", // data type
        "data": {
          "x": "129.3112381",
          "y": "35.5396493"
        }
      },
      "time": 1579443896001
    }
  }
}
```

### POST

```js
(async () => {
  await setMaxMemo(10);
  await setExpirationTime(5000);
  const { data } = await memoFetch('https://postman-echo.com/post', {
    headers: {
      'Content-Type': 'application/json',
    },

    method: 'POST',
    body: { b: 4 },
  });

  console.log(data);
})();
```

## APIs

### memoFetch

```js
import { memoFetch, setExpirationTime, setMaxMemo } from 'memofetch';

const main = async () => {
  await setMaxMemo(30);
  await setExpirationTime(5000);

  const { data } = await memoFetch(
    'https://postman-echo.com/get?foo1=bar1&foo2=bar2',
  );

  console.log(data);
};
```

### setConfigPath

- **Default :** `process.cwd()`

```js
import { setConfigPath } from 'memoFetch';

setConfigPath('./config/memo.json');
```

### setExpirationTime

- **Unit :** `ms`
- **Default :** `5000`

```js
import { setExpirationTime } from 'memoFetch';

setExpirationTime(3600 * 1000); // set to 1hr
```

### setMaxMemo

- **Default :** `10`

```js
import { setMaxMemo } from 'memoFetch';

setMaxMemo(50);
```
