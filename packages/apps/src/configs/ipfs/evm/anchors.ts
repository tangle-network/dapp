export const fetchWasmForEdges = async (maxEdges: number) => {
  let ipfsHash: string;

  switch (maxEdges) {
    case 1:
      ipfsHash = 'QmUZVsPd3fDWfncbiZfWVKi4DX9PG1VX8oqVQrCHXFh8dV';
      break;
    case 2:
      ipfsHash = 'QmZcyRgorkHDWf5Tx8jnb1D9mKkwWc5DdYbWYspJLSGNbG';
      break;
    case 3:
      ipfsHash = 'QmWy3pxQt9tYFyDSnqiyNtgjMacex37sPeneZBYCpFTkCz';
      break;
    case 4:
      ipfsHash = 'Qma7YsTpqUuBVGawLEZhrQyobtKSX1kJW25q2rdGQYaGf5';
      break;
    case 5:
      ipfsHash = 'Qme47CdNasWDUz2u1m1HtbqMJG3vLPFyDj2Gr5HT3JAzLn';
      break;
    default:
      ipfsHash = 'QmUZVsPd3fDWfncbiZfWVKi4DX9PG1VX8oqVQrCHXFh8dV';
      break;
  }

  try {
    const ipfsWasmRequest = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
    const wasmBuf = await ipfsWasmRequest.arrayBuffer();
    return wasmBuf;
  } catch (e) {
    console.log('error when fetching wasm from ipfs: ', e);
  }
};

export const fetchKeyForEdges = async (maxEdges: number) => {
  let ipfsHash: string;

  switch (maxEdges) {
    case 1:
      ipfsHash = 'QmY2QVnVepKKamEzUYy2Hzw5ZQrtrG31repDr25Gr7SYWd';
      break;
    case 2:
      ipfsHash = 'QmeaX6KfJTC9oixvjig4RMS3bMNizAqQXNRTh6sadAnzps';
      break;
    case 3:
      ipfsHash = 'QmPs3SCyZ2uboSrpzdQAT9JkYyybjrpcAF2Fhb2QYHgWf8';
      break;
    case 4:
      ipfsHash = 'QmdBsxtCBzYQw1yo3n4goeVyZ5iDhJN33QSBqX88Dz3mVX';
      break;
    case 5:
      ipfsHash = 'Qmc58Pq8iP3y12crAvjyVdnT2z9hA7TyduhANjSNrJz8Sp';
      break;
    default:
      ipfsHash = 'QmY2QVnVepKKamEzUYy2Hzw5ZQrtrG31repDr25Gr7SYWd';
      break;
  }

  try {
    const ipfsKeyRequest = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
    const circuitKeyArrayBuffer = await ipfsKeyRequest.arrayBuffer();
    const circuitKey = new Uint8Array(circuitKeyArrayBuffer);
    return circuitKey;
  } catch (e) {
    console.log('error when fetching circuit key from ipfs: ', e);
  }
};
