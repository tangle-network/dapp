import ConnectWalletButton from '@tangle-network/tangle-shared-ui/components/ConnectWalletButton';
import NetworkSelectorDropdown from '@tangle-network/tangle-shared-ui/components/NetworkSelectorDropdown';
import { type FC } from 'react';
import { useLocation } from 'react-router';
import ClaimRewardsDropdown from '../features/claimRewards/components/ClaimRewardsDropdown';
import { PagePath } from '../types';

const TopNavigationPanel: FC = () => {
  const location = useLocation();
  const isInBridgePath = location.pathname.startsWith(PagePath.BRIDGE);

  return (
    <div className="flex items-center gap-2">
      <ClaimRewardsDropdown />

      <NetworkSelectorDropdown disableChainSelection={isInBridgePath} />

      <ConnectWalletButton />
    </div>
  );
};

export default TopNavigationPanel;
