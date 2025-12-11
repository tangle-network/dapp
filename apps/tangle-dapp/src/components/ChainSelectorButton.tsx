'use client';

import NetworkSelectorDropdown from '@tangle-network/tangle-shared-ui/components/NetworkSelectorDropdown';
import {
  ANVIL_LOCAL_NETWORK,
  BASE_SEPOLIA_NETWORK,
  BASE_NETWORK,
} from '@tangle-network/ui-components/constants/networks';
import { FC } from 'react';

// EVM networks available in tangle-dapp
const TANGLE_DAPP_NETWORKS = [
  ANVIL_LOCAL_NETWORK,
  BASE_SEPOLIA_NETWORK,
  BASE_NETWORK,
];

const ChainSelectorButton: FC = () => {
  return (
    <NetworkSelectorDropdown
      networks={TANGLE_DAPP_NETWORKS}
      showCustomEndpoint
    />
  );
};

export default ChainSelectorButton;
