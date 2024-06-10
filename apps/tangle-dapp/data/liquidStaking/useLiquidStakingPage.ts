'use client';

import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { useEffect } from 'react';

import useNetworkStore from '../../context/useNetworkStore';

/**
 * Visiting the liquid staking page should change the active network
 * to the Tangle Restaking Parachain network. To avoid making the entire
 * page a client component, use a hook to handle the network change.
 */
const useLiquidStakingPage = () => {
  const { setNetwork, setIsLocked } = useNetworkStore();

  // Set the network to the Tangle Restaking Parachain network,
  // and prevent the user from changing the network. This is because
  // all functionality within the liquid staking page requires the
  // Tangle Restaking Parachain network.
  useEffect(() => {
    setNetwork(TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK);
    setIsLocked(true);
  }, [setIsLocked, setNetwork]);
};

export default useLiquidStakingPage;
