import { EVMChainId } from '@tangle-network/dapp-types/ChainId';
import { defineChain } from 'viem';

import {
  TANGLE_TESTNET_EVM_EXPLORER_URL,
  TANGLE_TESTNET_HTTP_RPC_ENDPOINT,
} from '../../../constants';

const tangleTestnetEVM = defineChain({
  id: EVMChainId.TangleTestnetEVM,
  name: 'Tangle Testnet',
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 776_767,
    },
  },
  nativeCurrency: {
    name: 'Testnet Tangle Network Token',
    symbol: 'tTNT',
    decimals: 18,
  },
  blockExplorers: {
    default: {
      name: 'Tangle Testnet EVM Explorer',
      url: TANGLE_TESTNET_EVM_EXPLORER_URL,
    },
  },
  rpcUrls: {
    default: {
      http: [TANGLE_TESTNET_HTTP_RPC_ENDPOINT],
    },
  },
});

export default tangleTestnetEVM;
