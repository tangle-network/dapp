import { EVMChainId } from '@webb-tools/dapp-types/ChainId';
import { defineChain } from 'viem';

import {
  TANGLE_MAINNET_EVM_EXPLORER_URL,
  TANGLE_MAINNET_HTTP_RPC_ENDPOINT,
} from '../../../constants/tangle';

const tangleMainnetEVM = defineChain({
  id: EVMChainId.TangleMainnetEVM,
  name: 'Tangle Mainnet EVM',
  nativeCurrency: {
    name: 'Tangle Network Token',
    symbol: 'TNT',
    decimals: 18,
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
