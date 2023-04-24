// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { withLocalFixtures } from '@webb-tools/react-environment/app-mode';

import { getCachedFixtureURI } from '..';
import { cachedFetch } from '@webb-tools/browser-utils';

export const fetchVAnchorKeyFromAws = async (
  maxEdges: number,
  small: boolean,
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
      if (small) {
        filePath = isSubstrate ? '2-2-2' : 'vanchor_2/2';
        cachedURI = getCachedFixtureURI(filePath);
      } else {
        filePath = isSubstrate ? '2-16-2' : 'vanchor_16/2';
        cachedURI = getCachedFixtureURI(filePath);
      }

      break;
    case 7:
      if (small) {
        filePath = isSubstrate ? '32-2-2' : 'vanchor_2/8';
        cachedURI = getCachedFixtureURI(filePath);
      } else {
        filePath = isSubstrate ? '32-16-2' : 'vanchor_16/8';
        cachedURI = getCachedFixtureURI(filePath);
      }

      break;
    default:
      if (small) {
        filePath = isSubstrate ? '2-2-2' : 'vanchor_2/2';
        cachedURI = getCachedFixtureURI(filePath);
      } else {
        filePath = isSubstrate ? '2-16-2' : 'vanchor_16/2';
        cachedURI = getCachedFixtureURI(filePath);
      }

      break;
  }

  let deployment = process.env.DEPLOYMENT;
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

export const fetchVAnchorWasmFromAws = async (
  maxEdges: number,
  small: boolean,
  abortSignal: AbortSignal
) => {
  let filePath: string;
  let cachedURI: string;

  switch (maxEdges) {
    case 1:
      if (small) {
        filePath = 'vanchor_2/2/poseidon_vanchor_2_2.wasm';
        cachedURI = getCachedFixtureURI(filePath);
      } else {
        filePath = 'vanchor_16/2/poseidon_vanchor_16_2.wasm';
        cachedURI = getCachedFixtureURI(filePath);
      }

      break;
    case 7:
      if (small) {
        filePath = 'vanchor_2/8/poseidon_vanchor_2_8.wasm';
        cachedURI = getCachedFixtureURI(filePath);
      } else {
        filePath = 'vanchor_16/8/poseidon_vanchor_16_8.wasm';
        cachedURI = getCachedFixtureURI(filePath);
      }

      break;
    default:
      if (small) {
        filePath = 'vanchor_2/2/poseidon_vanchor_2_2.wasm';
        cachedURI = getCachedFixtureURI(filePath);
      } else {
        filePath = 'vanchor_16/2/poseidon_vanchor_16_2.wasm';
        cachedURI = getCachedFixtureURI(filePath);
      }

      break;
  }

  let deployment = process.env.DEPLOYMENT;
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
