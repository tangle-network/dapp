import NetworkSelectorDropdown from '@webb-tools/tangle-shared-ui/components/NetworkSelectorDropdown';
import { useLocation } from 'react-router';
import { type FC } from 'react';

import { PagePath } from '../../types';

const NetworkSelectorButton: FC = () => {
  const location = useLocation();

  const isInLiquidStakingPage = location.pathname.startsWith(
    PagePath.LIQUID_STAKING,
  );

  const isInBridgePath = location.pathname.startsWith(PagePath.BRIDGE);

  // Disable network switching on certain pages.
  if (isInBridgePath || isInLiquidStakingPage) {
    return null;
  }

  return <NetworkSelectorDropdown />;
};

export default NetworkSelectorButton;
