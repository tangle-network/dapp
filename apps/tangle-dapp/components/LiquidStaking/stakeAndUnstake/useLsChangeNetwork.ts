import { useWebbUI } from '@webb-tools/webb-ui-components';
import { useCallback } from 'react';

import { LsNetworkId } from '../../../constants/liquidStaking/types';
import { NETWORK_FEATURE_MAP } from '../../../constants/networks';
import { useLsStore } from '../../../data/liquidStaking/useLsStore';
import useNetworkSwitcher from '../../../hooks/useNetworkSwitcher';
import { NetworkFeature } from '../../../types';
import getLsTangleNetwork from '../../../utils/liquidStaking/getLsTangleNetwork';

const useLsChangeNetwork = () => {
  const { lsNetworkId, setSelectedNetworkId } = useLsStore();
  const { switchNetwork } = useNetworkSwitcher();
  const { notificationApi } = useWebbUI();

  const tryChangeNetwork = useCallback(
    async (newLsNetworkId: LsNetworkId) => {
      // No need to change network if it's already selected.
      if (lsNetworkId === newLsNetworkId) {
        return;
      }

      const tangleNetwork = getLsTangleNetwork(newLsNetworkId);

      const supportsLiquidStaking = NETWORK_FEATURE_MAP[
        tangleNetwork.id
      ].includes(NetworkFeature.LsPools);

      if (!supportsLiquidStaking) {
        notificationApi({
          message: 'Network does not support liquid staking yet',
          variant: 'error',
        });

        return;
      }

      if (await switchNetwork(tangleNetwork, false)) {
        setSelectedNetworkId(newLsNetworkId);
      }
    },
    [notificationApi, lsNetworkId, setSelectedNetworkId, switchNetwork],
  );

  return tryChangeNetwork;
};

export default useLsChangeNetwork;
