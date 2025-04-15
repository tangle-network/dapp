import ConnectWalletButton from '@tangle-network/tangle-shared-ui/components/ConnectWalletButton';
import NetworkSelectorDropdown from '@tangle-network/tangle-shared-ui/components/NetworkSelectorDropdown';
import { type FC } from 'react';
import { useLocation } from 'react-router';
import useBridgeStore from '../features/bridge/context/useBridgeStore';
import ClaimRewardsDropdown from '../features/claimRewards/components/ClaimRewardsDropdown';
import { PagePath } from '../types';
// import TxHistoryDrawer from '../components/TxHistoryDrawer';

const TopNavigationPanel: FC = () => {
  const location = useLocation();
  const isInBridgePath = location.pathname.startsWith(PagePath.BRIDGE);
  const selectedSourceChain = useBridgeStore(
    (state) => state.selectedSourceChain,
  );

  return (
    <div className="flex items-center gap-2">
      <ClaimRewardsDropdown />

      <NetworkSelectorDropdown
        disableChainSelection={isInBridgePath}
        preferredChain={isInBridgePath ? selectedSourceChain : undefined}
      />

      <ConnectWalletButton
        showChainSpecificWallets={isInBridgePath}
        preferredChain={isInBridgePath ? selectedSourceChain : undefined}
      />
      {/** Hide for now, until it is fully implemented. */}
      {/* <TxHistoryDrawer /> */}
    </div>
  );
};

export default TopNavigationPanel;
