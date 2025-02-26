import { Payout } from '@tangle-network/tangle-shared-ui/types';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';

/**
 * Calculates unclaimed payouts by filtering out claimed eras
 * @param payouts Array of payouts to filter
 * @param claimedErasByValidator Map of claimed eras by validator
 * @param getClaimedEras Function to get the latest claimed eras for a validator
 * @returns Array of filtered payouts with only unclaimed eras
 */
function filterClaimedPayouts(
  payouts: Payout[] | null | undefined,
  claimedErasByValidator: Record<SubstrateAddress, number[]>,
  getClaimedEras: (validatorAddress: SubstrateAddress) => number[],
): Payout[] {
  if (!payouts || !payouts.length) return [];

  return payouts
    .map((payout) => {
      if (!payout.validator.address) return null;

      const claimedEras =
        claimedErasByValidator[payout.validator.address] || [];

      const latestClaimedEras = getClaimedEras(payout.validator.address);

      const allClaimedEras = [
        ...new Set([...claimedEras, ...latestClaimedEras]),
      ];

      const unclaimedEras = payout.eras
        .filter((era) => !allClaimedEras.includes(era))
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
