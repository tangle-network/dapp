import NetworkSelectorDropdown from '@tangle-network/tangle-shared-ui/components/NetworkSelectorDropdown';
import ConnectWalletButton from '@tangle-network/tangle-shared-ui/components/ConnectWalletButton';
import { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

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
        <NetworkSelectorDropdown />

        <ConnectWalletButton />
      </div>
    </header>
  );
}
