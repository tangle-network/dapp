import ConnectWalletButton from '@tangle-network/tangle-shared-ui/components/ConnectWalletButton';
import { type FC } from 'react';
import { useLocation } from 'react-router';
import { PagePath } from '../types';
import NetworkSelectorDropdown from '@tangle-network/tangle-shared-ui/components/NetworkSelectorDropdown';
import useBridgeStore from '../context/bridge/useBridgeStore';
// import TxHistoryDrawer from '../components/TxHistoryDrawer';

const TopNavigationPanel: FC = () => {
  const location = useLocation();
  const isInBridgePath = location.pathname.startsWith(PagePath.BRIDGE);
  const selectedSourceChain = useBridgeStore(
    (state) => state.selectedSourceChain,
  );

  return (
    <div className="flex items-center gap-2">
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
