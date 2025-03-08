import { Payout } from '@tangle-network/tangle-shared-ui/types';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { NetworkId } from '@tangle-network/ui-components/constants/networks';

/**
 * Calculates unclaimed payouts by filtering out claimed eras
 * @param payouts Array of payouts to filter
 * @param claimedErasByValidator Map of claimed eras by validator
 * @param getClaimedEras Function to get the latest claimed eras for a validator
 * @param networkId The network ID to filter payouts for
 * @returns Array of filtered payouts with only unclaimed eras
 */
function filterClaimedPayouts(
  payouts: Payout[] | null | undefined,
  claimedErasByValidator: Record<string, number[]>,
  getClaimedEras: (
    networkId: NetworkId,
    validatorAddress: SubstrateAddress,
  ) => number[],
  networkId: NetworkId,
): Payout[] {
  if (!payouts || !payouts.length) return [];

  return payouts
    .map((payout) => {
      if (!payout.validator.address) return null;

      const latestClaimedEras = getClaimedEras(
        networkId,
        payout.validator.address,
      );

      if (latestClaimedEras.length === 0) return payout;

      const unclaimedEras = payout.eras
        .filter((era) => !latestClaimedEras.includes(era))
        .sort((a, b) => a - b);

      if (unclaimedEras.length === 0) return null;

      return {
        ...payout,
        eras: unclaimedEras,
      };
    })
    .filter((payout): payout is NonNullable<typeof payout> => payout !== null);
}

export default filterClaimedPayouts;
