import { EVMChainId } from '@tangle-network/dapp-types/ChainId';
import { defineChain } from 'viem';

import {
  TANGLE_MAINNET_EVM_EXPLORER_URL,
  TANGLE_MAINNET_HTTP_RPC_ENDPOINT,
} from '../../../constants/tangle';

const tangleMainnetEVM = defineChain({
  id: EVMChainId.TangleMainnetEVM,
  name: 'Tangle Mainnet',
  nativeCurrency: {
    name: 'Tangle Network Token',
    symbol: 'TNT',
    decimals: 18,
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 4_458_796,
    },
  },
  blockExplorers: {
    default: {
      name: 'Tangle Mainnet EVM Explorer',
      url: TANGLE_MAINNET_EVM_EXPLORER_URL,
    },
  },
  rpcUrls: {
    default: {
      http: [TANGLE_MAINNET_HTTP_RPC_ENDPOINT],
    },
  },
});

export default tangleMainnetEVM;
