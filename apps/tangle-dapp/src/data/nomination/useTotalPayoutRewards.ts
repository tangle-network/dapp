import { BN, formatBalance } from '@polkadot/util';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import useSWR from 'swr';
import { getPayouts } from '../payouts/getPayouts';
import { useClaimedEras } from '../../hooks/useClaimedEras';
import { useMemo } from 'react';
import filterClaimedPayouts from '../payouts/filterClaimedPayouts';
import useAgnosticAccountInfo from '@tangle-network/tangle-shared-ui/hooks/useAgnosticAccountInfo';
import toSubstrateAddress from '@tangle-network/ui-components/utils/toSubstrateAddress';

/**
 * Hook to calculate the total unclaimed payout rewards
 * @returns Object containing the total unclaimed rewards and any error
 */
export default function useTotalPayoutRewards() {
  const rpcEndpoint = useNetworkStore((store) => store.network.wsRpcEndpoint);
  const { getClaimedEras, claimedErasByValidator } = useClaimedEras();
  const { nativeTokenSymbol } = useNetworkStore();
  const { isEvm, evmAddress, substrateAddress } = useAgnosticAccountInfo();

  const userSubstrateAddress =
    isEvm && evmAddress ? toSubstrateAddress(evmAddress) : substrateAddress;

  // Fetch payouts data
  const {
    data: payoutsData,
    error: payoutsError,
    isLoading,
  } = useSWR(
    ['payoutsData', userSubstrateAddress, rpcEndpoint, nativeTokenSymbol],
    ([, address, rpcEndpoint, nativeTokenSymbol]) =>
      getPayouts(address, rpcEndpoint, nativeTokenSymbol),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 5000,
      dedupingInterval: 5000,
    },
  );

  // Calculate unclaimed payouts using the shared utility function
  const unclaimedPayouts = useMemo(() => {
    if (!substrateAddress) return [];

    return filterClaimedPayouts(
      payoutsData?.payouts,
      claimedErasByValidator,
      getClaimedEras,
    );
  }, [payoutsData, claimedErasByValidator, getClaimedEras, substrateAddress]);

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
