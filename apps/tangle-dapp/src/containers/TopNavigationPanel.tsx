import ConnectWalletButton from '@tangle-network/tangle-shared-ui/components/ConnectWalletButton';
import { type FC } from 'react';

import NetworkSelectionButton from '../components/NetworkSelectorButton';
import TxHistoryDrawer from '../components/TxHistoryDrawer';

const TopNavigationPanel: FC = () => {
  return (
    <div className="flex items-center gap-2">
      <NetworkSelectionButton />

      <ConnectWalletButton />

      {/** Hide for now, until it is fully implemented. */}
      {/* <TxHistoryDrawer /> */}
    </div>
  );
};

export default TopNavigationPanel;
