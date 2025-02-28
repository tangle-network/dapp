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
      address: '0xC008F1301EB78017d61f5de8Dd4F5c5ecCBC497c',
    },
  },
  nativeCurrency: {
    name: 'Test Tangle Network Token',
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
