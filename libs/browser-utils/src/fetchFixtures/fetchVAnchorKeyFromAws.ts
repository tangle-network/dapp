import { withLocalFixtures } from '@webb-tools/dapp-types/appMode';
import { cachedFetch } from '../download';
import getCachedFixtureURI from './getCachedFixtureURI';

const fetchVAnchorKeyFromAws = async (
  maxEdges: number,
  isSmall?: boolean,
  isSubstrate?: boolean,
  abortSignal?: AbortSignal
) => {
  let filePath: string;
  let cachedURI: string;

  const filePathPrefix = isSubstrate ? 'substrate/vanchor/bn254/x5' : '';
  const filePathSuffix = isSubstrate
    ? 'proving_key_uncompressed.bin'
    : 'circuit_final.zkey';

  switch (maxEdges) {
    case 1:
      if (isSmall) {
        filePath = isSubstrate ? '2-2-2' : 'vanchor_2/2';
        cachedURI = getCachedFixtureURI(filePath);
      } else {
        filePath = isSubstrate ? '2-16-2' : 'vanchor_16/2';
        cachedURI = getCachedFixtureURI(filePath);
      }

      break;
    case 7:
      if (isSmall) {
        filePath = isSubstrate ? '32-2-2' : 'vanchor_2/8';
        cachedURI = getCachedFixtureURI(filePath);
      } else {
        filePath = isSubstrate ? '32-16-2' : 'vanchor_16/8';
        cachedURI = getCachedFixtureURI(filePath);
      }

      break;
    default:
      if (isSmall) {
        filePath = isSubstrate ? '2-2-2' : 'vanchor_2/2';
        cachedURI = getCachedFixtureURI(filePath);
      } else {
        filePath = isSubstrate ? '2-16-2' : 'vanchor_16/2';
        cachedURI = getCachedFixtureURI(filePath);
      }

      break;
  }

  let deployment = process.env['DEPLOYMENT'];
  if (!deployment) {
    deployment = 'develop';
  }

  try {
    const fullFilePath = `${
      filePathPrefix ? `${filePathPrefix}/` : ''
    }${filePath}/${filePathSuffix}`;

    const url = withLocalFixtures()
      ? cachedURI
      : `https://dapp-fixtures.s3.amazonaws.com/${deployment}/${fullFilePath}`;

    const key = await cachedFetch(url, { signal: abortSignal });

    return key;
  } catch (e) {
    console.log('error when fetching circuit key from aws: ', e);
    throw e;
  }
};

export default fetchVAnchorKeyFromAws;
