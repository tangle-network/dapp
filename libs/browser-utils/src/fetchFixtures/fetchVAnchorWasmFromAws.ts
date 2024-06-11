import { withLocalFixtures } from '@webb-tools/dapp-types/appMode';
import { cachedFetch } from '../download';
import getCachedFixtureURI from './getCachedFixtureURI';

const fetchVAnchorWasmFromAws = async (
  maxEdges: number,
  isSmall?: boolean,
  abortSignal?: AbortSignal,
) => {
  let filePath: string;
  let cachedURI: string;

  switch (maxEdges) {
    case 1:
      if (isSmall) {
        filePath = 'vanchor_2/2/poseidon_vanchor_2_2.wasm';
        cachedURI = getCachedFixtureURI(filePath);
      } else {
        filePath = 'vanchor_16/2/poseidon_vanchor_16_2.wasm';
        cachedURI = getCachedFixtureURI(filePath);
      }

      break;
    case 7:
      if (isSmall) {
        filePath = 'vanchor_2/8/poseidon_vanchor_2_8.wasm';
        cachedURI = getCachedFixtureURI(filePath);
      } else {
        filePath = 'vanchor_16/8/poseidon_vanchor_16_8.wasm';
        cachedURI = getCachedFixtureURI(filePath);
      }

      break;
    default:
      if (isSmall) {
        filePath = 'vanchor_2/2/poseidon_vanchor_2_2.wasm';
        cachedURI = getCachedFixtureURI(filePath);
      } else {
        filePath = 'vanchor_16/2/poseidon_vanchor_16_2.wasm';
        cachedURI = getCachedFixtureURI(filePath);
      }

      break;
  }

  let deployment = process.env['DEPLOYMENT'];
  if (!deployment) {
    deployment = 'develop';
  }

  try {
    const url = withLocalFixtures()
      ? cachedURI
      : `https://dapp-fixtures.s3.amazonaws.com/${deployment}/${filePath}`;

    const wasm = await cachedFetch(url, {
      signal: abortSignal,
    });

    return wasm;
  } catch (e) {
    console.log('error when fetching wasm from aws: ', e);
    throw e;
  }
};

export default fetchVAnchorWasmFromAws;
