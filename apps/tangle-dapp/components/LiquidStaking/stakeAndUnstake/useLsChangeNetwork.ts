import { useWebbUI } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { useCallback } from 'react';

import { LsNetworkId } from '../../../constants/liquidStaking/types';
import { NETWORK_FEATURE_MAP } from '../../../constants/networks';
import { useLsStore } from '../../../data/liquidStaking/useLsStore';
import useNetworkSwitcher from '../../../hooks/useNetworkSwitcher';
import { NetworkFeature } from '../../../types';
import getLsNetwork from '../../../utils/liquidStaking/getLsNetwork';
import getLsTangleNetwork from '../../../utils/liquidStaking/getLsTangleNetwork';

const useLsChangeNetwork = () => {
  const { selectedNetworkId, setSelectedNetworkId } = useLsStore();
  const { switchNetwork } = useNetworkSwitcher();
  const { notificationApi } = useWebbUI();

  const tryChangeNetwork = useCallback(
    async (newNetworkId: LsNetworkId) => {
      // No need to change network if it's already selected.
      if (selectedNetworkId === newNetworkId) {
        return;
      }

      const lsNetwork = getLsNetwork(newNetworkId);

      // Don't check connection to Ethereum mainnet liquifier;
      // only verify RPC connection to Tangle networks.
      if (lsNetwork.id === LsNetworkId.ETHEREUM_MAINNET_LIQUIFIER) {
        setSelectedNetworkId(newNetworkId);

        return;
      }

      const tangleNetwork = getLsTangleNetwork(newNetworkId);

      assert(tangleNetwork !== null);

      const networkFeatures = NETWORK_FEATURE_MAP[tangleNetwork.id];

      if (!networkFeatures.includes(NetworkFeature.LsPools)) {
        notificationApi({
          message: 'Network does not support liquid staking yet',
          variant: 'error',
        });

        return;
      }

      if (await switchNetwork(tangleNetwork, false)) {
        setSelectedNetworkId(newNetworkId);
      }
    },
    [notificationApi, selectedNetworkId, setSelectedNetworkId, switchNetwork],
  );

  return tryChangeNetwork;
};

export default useLsChangeNetwork;
