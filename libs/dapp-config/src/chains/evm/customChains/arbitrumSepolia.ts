import { EVMChainId } from '@tangle-network/dapp-types';
import { defineChain } from 'viem';

const arbitrumSepolia = defineChain({
  id: EVMChainId.ArbitrumSepolia,
  name: 'Arbitrum Sepolia',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia-rollup.arbitrum.io/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arbiscan',
      url: 'https://sepolia.arbiscan.io',
    },
  },
  testnet: true,
});

export default arbitrumSepolia;
