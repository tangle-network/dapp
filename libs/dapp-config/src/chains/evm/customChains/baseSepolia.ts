import { EVMChainId } from '@tangle-network/dapp-types';
import { defineChain } from 'viem';

const baseSepolia = defineChain({
  id: EVMChainId.BaseSepolia,
  name: 'Base Sepolia',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.base.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BaseScan',
      url: 'https://sepolia.basescan.org',
    },
  },
  testnet: true,
});

export default baseSepolia;
