import { getCachedFixtureURI, withLocalFixtures } from '@webb-dapp/utils/misc';

export const fetchWasmForEdges = async (maxEdges: number) => {
  let ipfsHash: string;
  let cachedURI: string;

  switch (maxEdges) {
    case 1:
      ipfsHash = 'QmUZVsPd3fDWfncbiZfWVKi4DX9PG1VX8oqVQrCHXFh8dV';
      cachedURI = getCachedFixtureURI('anchor_wasm_2.wasm');
      break;
    case 2:
      ipfsHash = 'QmZcyRgorkHDWf5Tx8jnb1D9mKkwWc5DdYbWYspJLSGNbG';
      cachedURI = getCachedFixtureURI('anchor_wasm_3.wasm');
      break;
    case 3:
      ipfsHash = 'QmWy3pxQt9tYFyDSnqiyNtgjMacex37sPeneZBYCpFTkCz';
      cachedURI = getCachedFixtureURI('anchor_wasm_4.wasm');
      break;
    case 4:
      ipfsHash = 'Qma7YsTpqUuBVGawLEZhrQyobtKSX1kJW25q2rdGQYaGf5';
      cachedURI = getCachedFixtureURI('anchor_wasm_5.wasm');
      break;
    case 5:
      ipfsHash = 'Qme47CdNasWDUz2u1m1HtbqMJG3vLPFyDj2Gr5HT3JAzLn';
      cachedURI = getCachedFixtureURI('anchor_wasm_6.wasm');
      break;
    default:
      ipfsHash = 'QmUZVsPd3fDWfncbiZfWVKi4DX9PG1VX8oqVQrCHXFh8dV';
      cachedURI = getCachedFixtureURI('anchor_wasm_2.wasm');
      break;
  }

  try {
    if (withLocalFixtures()) {
      const cachedWasmRequest = await fetch(cachedURI);
      const wasmBuf = await cachedWasmRequest.arrayBuffer();
      return wasmBuf;
    } else {
      const ipfsWasmRequest = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
      const wasmBuf = await ipfsWasmRequest.arrayBuffer();
      return wasmBuf;
    }
  } catch (e) {
    console.log('error when fetching wasm from ipfs: ', e);
  }
};

export const fetchKeyForEdges = async (maxEdges: number) => {
  let ipfsHash: string;
  let cachedURI: string;

  switch (maxEdges) {
    case 1:
      ipfsHash = 'QmY2QVnVepKKamEzUYy2Hzw5ZQrtrG31repDr25Gr7SYWd';
      cachedURI = getCachedFixtureURI('anchor_key_2.zkey');
      break;
    case 2:
      ipfsHash = 'QmeaX6KfJTC9oixvjig4RMS3bMNizAqQXNRTh6sadAnzps';
      cachedURI = getCachedFixtureURI('anchor_key_3.zkey');
      break;
    case 3:
      ipfsHash = 'QmPs3SCyZ2uboSrpzdQAT9JkYyybjrpcAF2Fhb2QYHgWf8';
      cachedURI = getCachedFixtureURI('anchor_key_4.zkey');
      break;
    case 4:
      ipfsHash = 'QmdBsxtCBzYQw1yo3n4goeVyZ5iDhJN33QSBqX88Dz3mVX';
      cachedURI = getCachedFixtureURI('anchor_key_5.zkey');
      break;
    case 5:
      ipfsHash = 'Qmc58Pq8iP3y12crAvjyVdnT2z9hA7TyduhANjSNrJz8Sp';
      cachedURI = getCachedFixtureURI('anchor_key_6.zkey');
      break;
    default:
      ipfsHash = 'QmY2QVnVepKKamEzUYy2Hzw5ZQrtrG31repDr25Gr7SYWd';
      cachedURI = getCachedFixtureURI('anchor_key_2.zkey');
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
  }
};
