'use client';

import NetworkSelectorDropdown from '@webb-tools/tangle-shared-ui/components/NetworkSelectorDropdown';
import { usePathname } from 'next/navigation';
import { type FC, useMemo } from 'react';

import { PagePath } from '../../types';

const NetworkSelectorButton: FC = () => {
  const pathname = usePathname();

  // Disable network switching when in Liquid Staking page,
  // since it would have no effect there.
  const isInLiquidStakingPage = pathname.startsWith(PagePath.LIQUID_STAKING);

  const isInBridgePath = useMemo(
    () => pathname.startsWith(PagePath.BRIDGE),
    [pathname],
  );

  if (isInBridgePath) {
    return null;
  }

  return (
    <NetworkSelectorDropdown isNetworkSwitchDisabled={isInLiquidStakingPage} />
  );
};

export default NetworkSelectorButton;
