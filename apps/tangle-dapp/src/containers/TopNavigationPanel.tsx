import ConnectWalletButton from '@tangle-network/tangle-shared-ui/components/ConnectWalletButton';
import ConnectionStatusButton from '@tangle-network/tangle-shared-ui/components/ConnectionStatusButton';
import { type FC } from 'react';
import ClaimRewardsDropdown from '../features/claimRewards/components/ClaimRewardsDropdown';
import ChainSelectorButton from '../components/ChainSelectorButton';

const TopNavigationPanel: FC = () => {
  return (
    <div className="flex items-center gap-2">
      <ClaimRewardsDropdown />

      <ConnectionStatusButton />

      <ChainSelectorButton />

      <ConnectWalletButton />
    </div>
  );
};

export default TopNavigationPanel;
