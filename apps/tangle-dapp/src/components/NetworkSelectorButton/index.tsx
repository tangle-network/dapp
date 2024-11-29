import NetworkSelectorDropdown from '@webb-tools/tangle-shared-ui/components/NetworkSelectorDropdown';
import { useLocation } from 'react-router-dom';
import { type FC } from 'react';

import { PagePath } from '../../types';

const NetworkSelectorButton: FC = () => {
  const { pathname } = useLocation();

  const isInLiquidStakingPage = pathname.startsWith(PagePath.LIQUID_STAKING);
  const isInBridgePath = pathname.startsWith(PagePath.BRIDGE);

  // Disable network switching on certain pages.
  if (isInBridgePath || isInLiquidStakingPage) {
    return null;
  }

  return <NetworkSelectorDropdown />;
};

export default NetworkSelectorButton;
