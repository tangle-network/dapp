import ConnectWalletButton from '@tangle-network/tangle-shared-ui/components/ConnectWalletButton';
import { type FC } from 'react';
import { useLocation } from 'react-router';
import { PagePath } from '../types';
import BridgeConnectWallet from '../components/bridge/BridgeConnectWallet';
import BridgeNetworkDisplay from '../components/bridge/BridgeNetworkDisplay';
import NetworkSelectorDropdown from '@tangle-network/tangle-shared-ui/components/NetworkSelectorDropdown';
// import TxHistoryDrawer from '../components/TxHistoryDrawer';

const TopNavigationPanel: FC = () => {
  const location = useLocation();

  const isInBridgePath = location.pathname.startsWith(PagePath.BRIDGE);

  return (
    <div className="flex items-center gap-2">
      {isInBridgePath ? <BridgeNetworkDisplay /> : <NetworkSelectorDropdown />}
      {isInBridgePath ? <BridgeConnectWallet /> : <ConnectWalletButton />}
      {/** Hide for now, until it is fully implemented. */}
      {/* <TxHistoryDrawer /> */}
    </div>
  );
};

export default TopNavigationPanel;
