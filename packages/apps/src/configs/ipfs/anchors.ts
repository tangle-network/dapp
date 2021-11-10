

export const fetchWasmForEdges = async (maxEdges: number): Promise<ArrayBuffer> => {
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
    const ipfsWasmRequest = fetch(`https://ipfs.co`)
  } catch (e) {
    console.log('error when fetching wasm from ipfs: ', e);
  }
};
