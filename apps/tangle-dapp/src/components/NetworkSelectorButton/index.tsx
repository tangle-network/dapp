import NetworkSelectorDropdown from '@webb-tools/tangle-shared-ui/components/NetworkSelectorDropdown';
import { useLocation } from 'react-router';
import { type FC } from 'react';

import { PagePath } from '../../types';
import useBridgeStore from '../../context/bridge/useBridgeStore';

const NetworkSelectorButton: FC = () => {
  const location = useLocation();

  const selectedSourceChain = useBridgeStore(
    (state) => state.selectedSourceChain,
  );

  const isInBridgePath = location.pathname.startsWith(PagePath.BRIDGE);

  return (
    <NetworkSelectorDropdown
      isBridgePage={isInBridgePath}
      bridgeSourceChain={selectedSourceChain}
    />
  );
};

export default NetworkSelectorButton;
