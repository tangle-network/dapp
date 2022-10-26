// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { withLocalFixtures } from '@nepoche/react-environment/app-mode';

import { getCachedFixtureURI } from '..';

// Variable anchor deployments either have 1 edge, or 7 edges.
// Each vanchor deployment corresponding to an edge has a small (2 input UTXOs)
//    and a large circuit (16 input UTXOs)
export const fetchVAnchorKeyFromIpfs = async (maxEdges: number, small: boolean, abortSignal: AbortSignal) => {
  let ipfsHash: string;
  let cachedURI: string;

  switch (maxEdges) {
    case 1:
      if (small) {
        ipfsHash = 'QmVETChPLMDpmrLPBKVBsetNcq48ssF2opHtjjKxxuxEQ3';
        cachedURI = getCachedFixtureURI('vanchor_key_2_small.zkey');
      } else {
        ipfsHash = 'QmQiucesWVmfesvHXw3KoxLRynq2TXFQzBRhnURWcCp89J';
        cachedURI = getCachedFixtureURI('vanchor_key_2_large.zkey');
      }

      break;
    case 7:
      if (small) {
        ipfsHash = 'QmeM3d7Lt56W1dQwajcfkNZMP7WHWdrPeqJxBPK5hor5nW';
        cachedURI = getCachedFixtureURI('vanchor_key_8_small.zkey');
      } else {
        ipfsHash = 'QmcZGwTgrJgUEsQ27wLmFXu86L7XeKnb7dW7xATXKAj2vE';
        cachedURI = getCachedFixtureURI('vanchor_key_8_large.zkey');
      }

      break;
    default:
      if (small) {
        ipfsHash = 'QmVETChPLMDpmrLPBKVBsetNcq48ssF2opHtjjKxxuxEQ3';
        cachedURI = getCachedFixtureURI('vanchor_key_2_small.zkey');
      } else {
        ipfsHash = 'QmQiucesWVmfesvHXw3KoxLRynq2TXFQzBRhnURWcCp89J';
        cachedURI = getCachedFixtureURI('vanchor_key_2_large.zkey');
      }

      break;
  }

  try {
    const url = withLocalFixtures() ? cachedURI : `https://ipfs.io/ipfs/${ipfsHash}`;
    const keyRequest = await fetch(url, { signal: abortSignal });
    const keyArrayBuffer = await keyRequest.arrayBuffer();
    const key = new Uint8Array(keyArrayBuffer);

    return key;
  } catch (e) {
    console.log('error when fetching circuit key from ipfs: ', e);
    throw e;
  }
};

// Variable anchor deployments either have 1 edge, or 7 edges.
// Each vanchor deployment corresponding to an edge has a small (2 input UTXOs)
//    and a large circuit (16 input UTXOs)
export const fetchVAnchorWasmFromIpfs = async (maxEdges: number, small: boolean, abortSignal: AbortSignal) => {
  let ipfsHash: string;
  let cachedURI: string;

  switch (maxEdges) {
    case 1:
      if (small) {
        ipfsHash = 'QmNrN9W8ejsSzjqrZYVZDwt7yh4Ldw62az3qmrkaSRXgGX';
        cachedURI = getCachedFixtureURI('vanchor_wasm_2_small.wasm');
      } else {
        ipfsHash = 'QmXRJRWLXvjVF9rwnVzwbDx2RGQEkkWcKnjjWjKQzwKizg';
        cachedURI = getCachedFixtureURI('vanchor_wasm_2_large.wasm');
      }

      break;
    case 7:
      if (small) {
        ipfsHash = 'QmTaghBK7qzrCpWBCZAUxrrF5ga4dGAmsfBB6ShFueFnV3';
        cachedURI = getCachedFixtureURI('vanchor_wasm_8_small.wasm');
      } else {
        ipfsHash = 'QmZZtkzKJgoV8cAWrZm3QU7d1QPiEunHMhP6vcNPXfv8yk';
        cachedURI = getCachedFixtureURI('vanchor_wasm_8_large.wasm');
      }

      break;
    default:
      if (small) {
        ipfsHash = 'QmNrN9W8ejsSzjqrZYVZDwt7yh4Ldw62az3qmrkaSRXgGX';
        cachedURI = getCachedFixtureURI('vanchor_wasm_2_small.wasm');
      } else {
        ipfsHash = 'QmXRJRWLXvjVF9rwnVzwbDx2RGQEkkWcKnjjWjKQzwKizg';
        cachedURI = getCachedFixtureURI('vanchor_wasm_2_large.wasm');
      }

      break;
  }

  try {
    const url = withLocalFixtures() ? cachedURI : `https://ipfs.io/ipfs/${ipfsHash}`;
    const cachedWasmRequest = await fetch(url, {
      signal: abortSignal,
    });
    const wasmBuffer = await cachedWasmRequest.arrayBuffer();
    const wasm = new Uint8Array(wasmBuffer);

    return wasm;
  } catch (e) {
    console.log('error when fetching wasm from ipfs: ', e);
    throw e;
  }
};

export const fetchVAnchorKeyFromAws = async (maxEdges: number, small: boolean, abortSignal: AbortSignal) => {
  let filePath: string;
  let cachedURI: string;

  switch (maxEdges) {
    case 1:
      if (small) {
        filePath = 'vanchor_2/2/circuit_final.zkey';
        cachedURI = getCachedFixtureURI('vanchor_key_2_small.zkey');
      } else {
        filePath = 'vanchor_16/2/circuit_final.zkey';
        cachedURI = getCachedFixtureURI('vanchor_key_2_large.zkey');
      }

      break;
    case 7:
      if (small) {
        filePath = 'vanchor_2/8/circuit_final.zkey';
        cachedURI = getCachedFixtureURI('vanchor_key_8_small.zkey');
      } else {
        filePath = 'vanchor_16/8/circuit_final.zkey';
        cachedURI = getCachedFixtureURI('vanchor_key_8_large.zkey');
      }

      break;
    default:
      if (small) {
        filePath = 'vanchor_2/2/circuit_final.zkey';
        cachedURI = getCachedFixtureURI('vanchor_key_2_small.zkey');
      } else {
        filePath = 'vanchor_16/2/circuit_final.zkey';
        cachedURI = getCachedFixtureURI('vanchor_key_2_large.zkey');
      }

      break;
  }

  let deployment = process.env.DEPLOYMENT;
  if (!deployment) {
    deployment = 'develop';
  }

  try {
    const url = withLocalFixtures() ? cachedURI : `https://dapp-fixtures.s3.amazonaws.com/${deployment}/${filePath}`;
    console.log('fetching zkey from', url);
    const keyRequest = await fetch(url, { signal: abortSignal });
    const keyArrayBuffer = await keyRequest.arrayBuffer();
    const key = new Uint8Array(keyArrayBuffer);

    return key;
  } catch (e) {
    console.log('error when fetching circuit key from ipfs: ', e);
    throw e;
  }
};

export const fetchVAnchorWasmFromAws = async (maxEdges: number, small: boolean, abortSignal: AbortSignal) => {
  let filePath: string;
  let cachedURI: string;

  switch (maxEdges) {
    case 1:
      if (small) {
        filePath = 'vanchor_2/2/poseidon_vanchor_2_2.wasm';
        cachedURI = getCachedFixtureURI('vanchor_wasm_2_small.wasm');
      } else {
        filePath = 'vanchor_16/2/poseidon_vanchor_16_2.wasm';
        cachedURI = getCachedFixtureURI('vanchor_wasm_2_large.wasm');
      }

      break;
    case 7:
      if (small) {
        filePath = 'vanchor_2/8/poseidon_vanchor_2_8.wasm';
        cachedURI = getCachedFixtureURI('vanchor_wasm_8_small.wasm');
      } else {
        filePath = 'vanchor_16/8/poseidon_vanchor_16_8.wasm';
        cachedURI = getCachedFixtureURI('vanchor_wasm_8_large.wasm');
      }

      break;
    default:
      if (small) {
        filePath = 'vanchor_2/2/poseidon_vanchor_2_2.wasm';
        cachedURI = getCachedFixtureURI('vanchor_wasm_2_small.wasm');
      } else {
        filePath = 'vanchor_16/2/poseidon_vanchor_16_2.wasm';
        cachedURI = getCachedFixtureURI('vanchor_wasm_2_large.wasm');
      }

      break;
  }

  let deployment = process.env.DEPLOYMENT;
  if (!deployment) {
    deployment = 'develop';
  }

  try {
    const url = withLocalFixtures() ? cachedURI : `https://dapp-fixtures.s3.amazonaws.com/${deployment}/${filePath}`;
    console.log('fetching wasm from', url);
    const cachedWasmRequest = await fetch(url, {
      signal: abortSignal,
    });
    const wasmBuffer = await cachedWasmRequest.arrayBuffer();
    const wasm = new Uint8Array(wasmBuffer);

    return wasm;
  } catch (e) {
    console.log('error when fetching wasm from ipfs: ', e);
    throw e;
  }
};
