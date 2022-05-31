// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { LoggerService } from '@webb-tools/app-util';

import { getCachedFixtureURI, withLocalFixtures } from '../../';

const logger = LoggerService.get('IPFS');

export async function fetchSubstrateAnchorProvingKey() {
  // TODO: change to anchor fixture
  const IPFSUrl = 'https://ipfs.io/ipfs/QmXRGKJZvFpCRw5ZvdxoeXtyteof4w1tPrdu9Jopz8YzB3';
  const cachedURI = getCachedFixtureURI('proving_key_substrate_anchor.bin');
  const ipfsKeyRequest = await fetch(withLocalFixtures() ? cachedURI : IPFSUrl);
  const circuitKeyArrayBuffer = await ipfsKeyRequest.arrayBuffer();

  logger.info('Done Fetching key');
  const circuitKey = new Uint8Array(circuitKeyArrayBuffer);

  return circuitKey;
}
