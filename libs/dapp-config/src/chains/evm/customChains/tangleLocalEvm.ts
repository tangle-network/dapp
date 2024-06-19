import { EVMChainId } from '@webb-tools/dapp-types/ChainId';
import { defineChain } from 'viem';

import { TANGLE_LOCAL_HTTP_RPC_ENDPOINT } from '../../../constants';

const tangleLocalEVM = defineChain({
  id: EVMChainId.TangleLocalEVM,
  name: 'Tangle Local EVM',
  nativeCurrency: {
    name: 'Local Test Tangle Network Token',
    symbol: 'tTNT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [TANGLE_LOCAL_HTTP_RPC_ENDPOINT],
    },
  },
});

export default tangleLocalEVM;
