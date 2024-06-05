import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import LoggerService from '../logger/LoggerService';

const logger = LoggerService.get('cached fetch');

async function cachedFetch(
  ...params: Parameters<typeof fetch>
): Promise<Uint8Array> {
  const fixturesCache = await caches.open('fixtures');
  const reqInput = params[0];
  let url = '';

  if (typeof reqInput === 'string') {
    url = reqInput;
  } else if (reqInput instanceof URL) {
    url = reqInput.toJSON();
  } else if (reqInput instanceof Request) {
    url = reqInput.url;
  }

  const key = new URL(url);
  const cachedResponse = await fixturesCache.match(key);

  if (cachedResponse && cachedResponse.ok) {
    logger.info(`Found key: ${url} on the cache`);
    const keyArrayBuffer = await cachedResponse.arrayBuffer();
    const reqData = new Uint8Array(keyArrayBuffer);
    return reqData;
  } else {
    logger.info(`Fetching key: ${url} from the network`);
    const response = await fetch(...params);
    if (response.ok) {
      // Handle the insuficient disk space error here
      try {
        await fixturesCache.put(url, response.clone());
      } catch {
        throw WebbError.from(WebbErrorCodes.InsufficientDiskSpace);
      }

      const keyArrayBuffer = await response.arrayBuffer();
      return new Uint8Array(keyArrayBuffer);
    } else {
      logger.error(`Failed to fetch ${url}`);
    }
  }

  throw new Error('network error');
}

export default cachedFetch;
