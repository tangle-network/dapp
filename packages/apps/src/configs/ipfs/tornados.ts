export const fetchTornadoProvingKey = async () => {
  let circuitDataResponse = await fetch('https://ipfs.io/ipfs/QmbX8PzkcU1SQwUis3zDWEKsn8Yjgy2vALNeghVM2uh31B');
  let circuitData = await circuitDataResponse.json();
  return circuitData;
};

export const fetchTornadoCircuitData = async () => {
  let proving_key_response = await fetch('https://ipfs.io/ipfs/QmQwgF8aWJzGSXoe1o3jrEPdcfBysWctB2Uwu7uRebXe2D');
  let proving_key = await proving_key_response.arrayBuffer();
  return proving_key;
};
