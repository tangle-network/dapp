import { BN, formatBalance } from '@polkadot/util';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import useSWR from 'swr';
import { getPayouts } from '../payouts/getPayouts';
import { useClaimedEras } from '../../hooks/useClaimedEras';
import { useMemo } from 'react';
import filterClaimedPayouts from '../payouts/filterClaimedPayouts';
import useSubstrateAddress from '@tangle-network/tangle-shared-ui/hooks/useSubstrateAddress';

/**
 * Hook to calculate the total unclaimed payout rewards
 * @returns Object containing the total unclaimed rewards and any error
 */
export default function useTotalPayoutRewards() {
  const rpcEndpoints = useNetworkStore((store) => store.network.wsRpcEndpoints);
  const { getClaimedEras } = useClaimedEras();
  const { nativeTokenSymbol } = useNetworkStore();
  const networkId = useNetworkStore((store) => store.network.id);

  const userSubstrateAddress = useSubstrateAddress();

  // Fetch payouts data
  const {
    data: payoutsData,
    error: payoutsError,
    isLoading,
  } = useSWR(
    ['payoutsData', userSubstrateAddress, rpcEndpoints, nativeTokenSymbol],
    ([, address, rpcEndpoints, nativeTokenSymbol]) =>
      getPayouts(address, rpcEndpoints, nativeTokenSymbol),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 5000,
      dedupingInterval: 5000,
    },
  );

  // Calculate unclaimed payouts using the shared utility function
  const unclaimedPayouts = useMemo(() => {
    if (!userSubstrateAddress) return [];

    return filterClaimedPayouts(
      payoutsData?.payouts,
      getClaimedEras,
      networkId,
    );
  }, [payoutsData, getClaimedEras, userSubstrateAddress, networkId]);

  // Calculate total rewards from unclaimed payouts
  const totalRewards = useMemo(() => {
    if (!unclaimedPayouts || unclaimedPayouts.length === 0) {
      return new BN(0);
    }

    return unclaimedPayouts.reduce(
      (total, payout) => total.add(payout.totalReward),
      new BN(0),
    );
  }, [unclaimedPayouts]);

  // Format the total rewards
  const formattedTotalRewards = useMemo(() => {
    if (totalRewards.isZero()) {
      return '0';
    }

    return formatBalance(totalRewards, {
      withUnit: nativeTokenSymbol,
    });
  }, [nativeTokenSymbol, totalRewards]);

  return {
    data: totalRewards,
    formattedTotal: formattedTotalRewards,
    unclaimedPayouts,
    error: payoutsError,
    isLoading,
  };
}
