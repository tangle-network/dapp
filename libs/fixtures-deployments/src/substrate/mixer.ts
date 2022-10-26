// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { withLocalFixtures } from '@nepoche/react-environment/app-mode';
import { LoggerService } from '@webb-tools/app-util';

import { getCachedFixtureURI } from '..';

const logger = LoggerService.get('IPFS');

export async function fetchSubstrateMixerProvingKey() {
  const IPFSUrl = 'https://ipfs.io/ipfs/QmfQUgqRXCdUiogiRU8ZdLFZD2vqVb9fHpLkL6DsGHwoLH';
  const cachedURI = getCachedFixtureURI('proving_key_substrate_mixer.bin');
  const ipfsKeyRequest = await fetch(withLocalFixtures() ? cachedURI : IPFSUrl);
  const circuitKeyArrayBuffer = await ipfsKeyRequest.arrayBuffer();

  logger.info(`Done Fetching key from ${ipfsKeyRequest.url}`);
  const circuitKey = new Uint8Array(circuitKeyArrayBuffer);

  return circuitKey;
}
