import { LoggerService } from '@webb-tools/browser-utils/logger';

const logger = LoggerService.get('cached fetch');
export async function cachedFetch(
  ...params: Parameters<typeof fetch>
): Promise<Uint8Array> {
  const fixturesCache = await caches.open('fixtures');
  const reqInput = params[0];
  let url: string = '';
  if (typeof reqInput === 'string') {
    url = reqInput;
  } else if (reqInput instanceof URL) {
    url = reqInput.toJSON();
  } else if (reqInput instanceof Request) {
    url = reqInput.url;
  }
  const key = new URL(url);
  const cachedResponse = await fixturesCache.match(key);
  logger.info(`Fetching url ${url} ->  key ${key}`);

  if (cachedResponse && cachedResponse.ok) {
    logger.info(`Key :${url} was found on the cache `);
    const keyArrayBuffer = await cachedResponse.arrayBuffer();
    const reqData = new Uint8Array(keyArrayBuffer);
    return reqData;
  } else {
    logger.info(`Key :${url} wasn't found on the cache `);
    const response = await fetch(...params);
    if (response.ok) {
      await fixturesCache.put(url, response.clone());
      const keyArrayBuffer = await response.arrayBuffer();
      return new Uint8Array(keyArrayBuffer);
    } else {
      logger.error(`Failed to fetch ${url}`);
    }
  }

  throw new Error('network error');
}
