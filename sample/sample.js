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

async () => {
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
};