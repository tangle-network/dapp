import NetworkSelectorDropdown from '@webb-tools/tangle-shared-ui/components/NetworkSelectorDropdown';
import { useLocation } from 'react-router';
import { useEffect, type FC } from 'react';

import { PagePath } from '../../types';
import useBridgeStore from '../../pages/bridge/context/useBridgeStore';

const NetworkSelectorButton: FC = () => {
  const location = useLocation();

  const selectedSourceChain = useBridgeStore(
    (state) => state.selectedSourceChain,
  );

  const isInLiquidStakingPage = location.pathname.startsWith(
    PagePath.LIQUID_STAKING,
  );

  const isInBridgePath = location.pathname.startsWith(PagePath.BRIDGE);

  // // Disable network switching on certain pages.
  // if (isInBridgePath || isInLiquidStakingPage) {
  //   return null;
  // }

  return (
    <NetworkSelectorDropdown
      isBridgePage={isInBridgePath}
      bridgeSourceChain={selectedSourceChain}
    />
  );
};

export default NetworkSelectorButton;
