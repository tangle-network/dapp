import { NetworkType } from '@tangle-network/tangle-shared-ui/graphql/graphql';
import {
  TANGLE_MAINNET_NETWORK,
  TANGLE_TESTNET_NATIVE_NETWORK,
} from '@tangle-network/ui-components/constants/networks';
import {
  EvmAddress,
  SubstrateAddress,
} from '@tangle-network/ui-components/types/address';

export const createAccountExplorerUrl = (
  address: SubstrateAddress | EvmAddress,
  network: NetworkType,
) => {
  switch (network) {
    case 'MAINNET':
      return TANGLE_MAINNET_NETWORK.createExplorerAccountUrl(address);
    case 'TESTNET':
      return TANGLE_TESTNET_NATIVE_NETWORK.createExplorerAccountUrl(address);
    default:
      console.error(`Unsupported network: ${network}`);
      return null;
  }
};
