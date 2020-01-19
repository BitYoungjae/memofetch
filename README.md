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

  const json = await memoFetch(
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

  console.log(json);
})();
```

### POST

```js
(async () => {
  await setMaxMemo(10);
  await setExpirationTime(5000);
  const json = await memoFetch('https://postman-echo.com/post', {
    headers: {
      'Content-Type': 'application/json',
    },

    method: 'POST',
    body: { b: 4 },
  });

  console.log(json);
})();
```

## Save in JSON format

```json
{
  "expiration-time": 5000,
  "memo": {
    "okI46Vj2LHYA/JcFTsGTfuiIUIg=": {
      "value": {
        "x": "126.8666435",
        "y": "37.5170100"
      },
      "time": 1579435600310
    }
  }
}
```

## APIs

### memoFetch

```js
import { memoFetch, setExpirationTime, setMaxMemo } from 'memofetch';

const main = async () => {
  await setMaxMemo(30);
  await setExpirationTime(5000);

  const json = await memoFetch(
    'https://postman-echo.com/get?foo1=bar1&foo2=bar2',
  );

  console.log(json);
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
