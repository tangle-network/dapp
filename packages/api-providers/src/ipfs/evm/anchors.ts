// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { getCachedFixtureURI, withLocalFixtures } from '../../';

// Variable anchor deployments either have 1 edge, or 7 edges.
// Each vanchor deployment corresponding to an edge has a small (2 input UTXOs)
//    and a large circuit (16 input UTXOs)
export const fetchVariableAnchorKeyForEdges = async (maxEdges: number, small: boolean) => {
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
    if (withLocalFixtures()) {
      const cachedKeyRequest = await fetch(cachedURI);
      const cachedKeyArrayBuffer = await cachedKeyRequest.arrayBuffer();
      const cachedKey = new Uint8Array(cachedKeyArrayBuffer);

      return cachedKey;
    } else {
      const ipfsKeyRequest = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
      const circuitKeyArrayBuffer = await ipfsKeyRequest.arrayBuffer();
      const circuitKey = new Uint8Array(circuitKeyArrayBuffer);

      return circuitKey;
    }
  } catch (e) {
    console.log('error when fetching circuit key from ipfs: ', e);
    throw e;
  }
};

// Variable anchor deployments either have 1 edge, or 7 edges.
// Each vanchor deployment corresponding to an edge has a small (2 input UTXOs)
//    and a large circuit (16 input UTXOs)
export const fetchVariableAnchorWasmForEdges = async (maxEdges: number, small: boolean) => {
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
    if (withLocalFixtures()) {
      const cachedWasmRequest = await fetch(cachedURI);
      const cachedWasmBuffer = await cachedWasmRequest.arrayBuffer();
      const cachedWasm = new Uint8Array(cachedWasmBuffer);

      return cachedWasm;
    } else {
      const ipfsWasmRequest = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
      const circuitWasmBuffer = await ipfsWasmRequest.arrayBuffer();
      const circuitWasm = new Uint8Array(circuitWasmBuffer);

      return circuitWasm;
    }
  } catch (e) {
    console.log('error when fetching wasm from ipfs: ', e);
    throw e;
  }
};
