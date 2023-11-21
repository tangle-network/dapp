import { EVMChainId } from '@webb-tools/dapp-types/ChainId';
import { createPublicClient, defineChain, http } from 'viem';

const tangleTestnet = defineChain({
  id: EVMChainId.TangleTestnet,
  name: 'Tangle Testnet',
  network: 'Tangle',
  nativeCurrency: {
    decimals: 18,
    name: 'Test Tangle Network Token',
    symbol: 'tTNT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-archive.tangle.tools', 'https://rpc.tangle.tools'],
      webSocket: ['wss://rpc-archive.tangle.tools'],
    },
    public: {
      http: ['https://rpc-archive.tangle.tools', 'https://rpc.tangle.tools'],
      webSocket: ['wss://rpc-archive.tangle.tools'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Tangle Testnet Explorer',
      url: 'https://explorer.tangle.tools',
    },
  },
});

export const evmClient = createPublicClient({
  chain: tangleTestnet,
  transport: http(),
});
