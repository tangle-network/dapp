

export const fetchWasmForEdges = async (maxEdges: number) => {
  let ipfsHash: string;

  switch (maxEdges) {
    case 1:
      ipfsHash = 'QmSVAxEWahZdH4gnS3qcWKbApSxsDU22YH1Z6GS5WWWZTa';
      break;
    case 2:
      ipfsHash = 'QmdxeboQBZwut9UEkViuZqFSiAJHyJ32dvbJpCZfWwkp3T';
      break;
    case 3:
      ipfsHash = 'QmRvAJhUQ7Rm3RSYTZ5r13BvdRXnd1gEXaSm7icQ7k5af4';
      break;
    case 4:
      ipfsHash = 'QmZoVake28adxmvK5T44bzKYLMBfwQ9hfqt8hcmab5DC4R';
      break;
    case 5:
      ipfsHash = 'QmXVeUkKJYvShyov1VJzE748kW78VYvb3DYyEVYuXRonoJ';
      break;
    default:
      ipfsHash = 'QmSVAxEWahZdH4gnS3qcWKbApSxsDU22YH1Z6GS5WWWZTa';
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
      ipfsHash = 'QmUBkb5P6CJbtywEdr2xiAY8rJz4Aak1uvu28oxoC3Z5QF';
      break;
    case 2:
      ipfsHash = 'QmRukP3kL2dHQc9jpV4gdwi2WVLsbQk8j72WXeqJY2xqQa';
      break;
    case 3:
      ipfsHash = 'QmWaGocEr1NMKageZmEUCoDxcQVeYCkddcDnW6z4JX4mh7';
      break;
    case 4:
      ipfsHash = 'QmRzqsRmXNCkm9ZrETFygLG6TgRQBnYyhYxAsQvwPsr3dH';
      break;
    case 5:
      ipfsHash = 'QmR6jms4hbvtzore2wWeri1Q9dCt9hoRAAx2jBq9BLg4Ak';
      break;
    default:
      ipfsHash = 'QmUBkb5P6CJbtywEdr2xiAY8rJz4Aak1uvu28oxoC3Z5QF';
      break;
  }

  try {
    const ipfsKeyRequest = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
    const circuitKey = await ipfsKeyRequest.arrayBuffer();
    return circuitKey;
  } catch (e) {
    console.log('error when fetching circuit key from ipfs: ', e);
  }
}
