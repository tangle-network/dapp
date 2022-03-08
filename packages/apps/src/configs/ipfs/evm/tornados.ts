import { getCachedFixtureURI, withLocalFixtures } from '@webb-dapp/utils/misc';

export const fetchTornadoCircuitData = async () => {
  const IPFSUrl = `https://ipfs.io/ipfs/QmbX8PzkcU1SQwUis3zDWEKsn8Yjgy2vALNeghVM2uh31B`;
  const cachedURI = getCachedFixtureURI('circuit_tornado.json');
  const ipfsRequest = await fetch(withLocalFixtures() ? cachedURI : IPFSUrl);
  const circuitData = await ipfsRequest.json();
  return circuitData;
};

export const fetchTornadoProvingKey = async () => {
  const IPFSUrl = `https://ipfs.io/ipfs/QmQwgF8aWJzGSXoe1o3jrEPdcfBysWctB2Uwu7uRebXe2D`;
  const cachedURI = getCachedFixtureURI('proving_key_tornado.bin');
  const ipfsRequest = await fetch(withLocalFixtures() ? cachedURI : IPFSUrl);
  let proving_key = await ipfsRequest.arrayBuffer();
  return proving_key;
};
