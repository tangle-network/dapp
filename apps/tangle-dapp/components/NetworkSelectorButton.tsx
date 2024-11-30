'use client';

import NetworkSelectorDropdown from '@webb-tools/tangle-shared-ui/components/NetworkSelectorDropdown';
import { usePathname } from 'next/navigation';
import { type FC } from 'react';

import { PagePath } from '../types';

const NetworkSelectorButton: FC = () => {
  const pathname = usePathname();

  const isInLiquidStakingPage = pathname.startsWith(PagePath.LIQUID_STAKING);

  const isInBridgePath = pathname.startsWith(PagePath.BRIDGE);

  // Disable network switching on certain pages.
  if (isInBridgePath || isInLiquidStakingPage) {
    return null;
  }

  return <NetworkSelectorDropdown />;
};

export default NetworkSelectorButton;
