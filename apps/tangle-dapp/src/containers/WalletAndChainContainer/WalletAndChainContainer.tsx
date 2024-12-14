import ConnectWalletButton from '@webb-tools/tangle-shared-ui/components/ConnectWalletButton';
import { type FC } from 'react';

import NetworkSelectionButton from '../../components/NetworkSelectorButton';

const WalletAndChainContainer: FC = () => {
  return (
    <div className="flex items-center gap-2">
      <NetworkSelectionButton />

      <ConnectWalletButton />
    </div>
  );
};

export default WalletAndChainContainer;
