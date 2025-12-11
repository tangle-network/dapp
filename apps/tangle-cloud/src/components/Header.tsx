import NetworkSelectorDropdown from '@tangle-network/tangle-shared-ui/components/NetworkSelectorDropdown';
import ConnectWalletButton from '@tangle-network/tangle-shared-ui/components/ConnectWalletButton';
import {
  ANVIL_LOCAL_NETWORK,
  BASE_NETWORK,
  BASE_SEPOLIA_NETWORK,
} from '@tangle-network/ui-components/constants/networks';
import { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

// EVM networks for tangle-cloud
const TANGLE_CLOUD_NETWORKS = [
  ANVIL_LOCAL_NETWORK,
  BASE_SEPOLIA_NETWORK,
  BASE_NETWORK,
];

export default function Header({
  className,
  ...props
}: ComponentProps<'header'>) {
  return (
    <header
      className={twMerge('py-6 max-w-screen-xl mx-auto', className)}
      {...props}
    >
      <div className="flex items-center justify-end gap-2">
        <NetworkSelectorDropdown
          networks={TANGLE_CLOUD_NETWORKS}
          showCustomEndpoint={false}
        />

        <ConnectWalletButton />
      </div>
    </header>
  );
}
