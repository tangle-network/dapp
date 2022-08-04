import { getCachedFixtureURI, withLocalFixtures } from '@webb-dapp/api-providers/utils';

export async function fetchSubstrateVAnchorProvingKey(edges: number, abortSignal: AbortSignal) {
  const IPFSUrl = 'https://ipfs.io/ipfs/QmZiNuAKp2QGp281bqasNqvqccPCGp4yoxWbK8feecefML';
  const cachedURI = getCachedFixtureURI('proving_key_uncompressed_sub_vanchor_2_2_2.bin');
  const url = withLocalFixtures() ? cachedURI : IPFSUrl;
  const ipfsKeyRequest = await fetch(url, { signal: abortSignal });
  const circuitKeyArrayBuffer = await ipfsKeyRequest.arrayBuffer();

  const circuitKey = new Uint8Array(circuitKeyArrayBuffer);

  return circuitKey;
}
