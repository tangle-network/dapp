import { useContext } from 'react';

import { PolkadotApiContext } from '../context/PolkadotApiContext';

export default function usePolkadotApi() {
  const ctx = useContext(PolkadotApiContext);
  if (ctx === undefined) {
    throw new Error('usePolkadotApi must be used within a PolkadotApiProvider');
  }
  return ctx;
}
