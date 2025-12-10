import ConnectWalletButton from '@tangle-network/tangle-shared-ui/components/ConnectWalletButton';
import { type FC } from 'react';
import ClaimRewardsDropdown from '../features/claimRewards/components/ClaimRewardsDropdown';
import ChainSelectorButton from '../components/ChainSelectorButton';

const TopNavigationPanel: FC = () => {
  return (
    <div className="flex items-center gap-2">
      <ClaimRewardsDropdown />

      <ChainSelectorButton />

      <ConnectWalletButton />
    </div>
  );
};

export default TopNavigationPanel;
