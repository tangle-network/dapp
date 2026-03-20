import NetworkSelectorDropdown from '@tangle-network/tangle-shared-ui/components/NetworkSelectorDropdown';
import ConnectWalletButton from '@tangle-network/tangle-shared-ui/components/ConnectWalletButton';
import ConnectionStatusButton from '@tangle-network/tangle-shared-ui/components/ConnectionStatusButton';
import { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';
import TxHistoryDrawer from './TxHistoryDrawer';
import { TANGLE_CLOUD_NETWORKS } from '../constants/networks';

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
        <TxHistoryDrawer />

        <ConnectionStatusButton />

        <NetworkSelectorDropdown
          networks={TANGLE_CLOUD_NETWORKS}
          showCustomEndpoint
        />

        <ConnectWalletButton />
      </div>
    </header>
  );
}
