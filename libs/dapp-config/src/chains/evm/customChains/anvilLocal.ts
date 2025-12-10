import { EVMChainId } from '@tangle-network/dapp-types/ChainId';
import { defineChain } from 'viem';

const anvilLocal = defineChain({
  id: EVMChainId.AnvilLocal,
  name: 'Anvil Local',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  testnet: true,
});

export default anvilLocal;
