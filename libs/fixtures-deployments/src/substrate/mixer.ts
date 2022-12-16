// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { withLocalFixtures } from '@webb-tools/react-environment/app-mode';
import { LoggerService } from '@webb-tools/app-util';

import { getCachedFixtureURI } from '..';
import { cachedFetch } from '@webb-tools/browser-utils';

const logger = LoggerService.get('IPFS');

export async function fetchSubstrateMixerProvingKey() {
  const IPFSUrl =
    'https://ipfs.io/ipfs/QmfQUgqRXCdUiogiRU8ZdLFZD2vqVb9fHpLkL6DsGHwoLH';
  const cachedURI = getCachedFixtureURI('proving_key_substrate_mixer.bin');
  return await cachedFetch(withLocalFixtures() ? cachedURI : IPFSUrl);
}
