import { ApiPromise, WsProvider } from '@polkadot/api';
import { BN, formatBalance } from '@polkadot/util';
import type { Option, u32 } from '@polkadot/types';
import type { EraIndex } from '@polkadot/types/interfaces';
import type { PalletStakingStakingLedger } from '@polkadot/types/lookup';
import { Payout } from '@tangle-network/tangle-shared-ui/types';
import assertSubstrateAddress from '@tangle-network/ui-components/utils/assertSubstrateAddress';

const HISTORY_DEPTH = 80;

export const getPayouts = async (
  useAddress: string,
  rpcEndpoint: string,
): Promise<{
  payouts: Payout[];
  totalReward: string;
}> => {
  try {
    // 1. Initialize API
    const provider = new WsProvider(rpcEndpoint);
    const api = await ApiPromise.create({ provider });

    // Set up the token decimals and symbol
    formatBalance.setDefaults({
      decimals: api.registry.chainDecimals[0],
      unit: 'tTNT',
    });

    // Get active era
    const activeEraOpt = await api.query.staking.activeEra();
    const activeEra = activeEraOpt.unwrapOrDefault();
    const activeEraNumber = activeEra.index.toNumber();

    // Calculate era range - show exactly HISTORY_DEPTH eras back from active era
    const startEra = Math.max(1, activeEraNumber - HISTORY_DEPTH);
    const endEra = activeEraNumber;

    const eras: EraIndex[] = [];
    for (let era = startEra; era <= endEra; era++) {
      eras.push(api.createType('EraIndex', era));
    }

    // 4. Get the staking ledger to check claimed rewards
    const stakingLedgerOpt = await api.query.staking.ledger(useAddress);

    let claimedEras: u32[] = [];
    if ((stakingLedgerOpt as Option<PalletStakingStakingLedger>).isSome) {
      const stakingLedger = (
        stakingLedgerOpt as Option<PalletStakingStakingLedger>
      ).unwrap();
      const ledgerData = stakingLedger.toHuman();
      if (ledgerData && 'claimedRewards' in ledgerData) {
        claimedEras = (ledgerData.claimedRewards as number[]).map((era) =>
          api.createType('u32', era),
        );
      }
    }

    // 5. Get rewards for all eras
    const rewards = await api.derive.staking.stakerRewardsMultiEras(
      [useAddress],
      eras,
    );

    // Track total rewards
    let totalRewardBN = new BN(0);

    // Get validator identities
    const validatorIdentities = new Map<string, string>();
    await Promise.all(
      Array.from(
        new Set(rewards[0].flatMap((r) => Object.keys(r.validators))),
      ).map(async (validatorAddress) => {
        const identity = await api.derive.accounts.info(validatorAddress);
        validatorIdentities.set(
          validatorAddress,
          identity.identity.display?.toString() || '',
        );
      }),
    );

    // 6. Group and format the rewards data by validator
    const validatorRewardsMap = new Map<
      string,
      { eras: number[]; totalReward: BN }
    >();

    rewards[0]
      .filter((reward) => !reward.isEmpty)
      .filter((reward) => {
        // Check if this era's reward has been claimed
        const isClaimed = claimedEras.some((claimedEra) =>
          claimedEra.eq(reward.era),
        );
        if (isClaimed) return false;

        // Only process unclaimed rewards with non-zero value
        const totalReward = Object.values(reward.validators).reduce(
          (total, { value }) => total.add(value),
          new BN(0),
        );
        return !totalReward.eq(new BN(0));
      })
      .forEach((reward) => {
        Object.entries(reward.validators).forEach(
          ([validatorAddress, { value }]) => {
            if (!value.eq(new BN(0))) {
              const existing = validatorRewardsMap.get(validatorAddress) || {
                eras: [],
                totalReward: new BN(0),
              };
              existing.eras.push(reward.era.toNumber());
              existing.totalReward = existing.totalReward.add(value);
              validatorRewardsMap.set(validatorAddress, existing);
              // Add to total rewards
              totalRewardBN = totalRewardBN.add(value);
            }
          },
        );
      });

    // Convert to PayoutTwo format
    const formattedPayouts = Array.from(validatorRewardsMap.entries()).map(
      ([validatorAddress, { eras, totalReward }]) => {
        return {
          eras: eras,
          validator: {
            address: assertSubstrateAddress(validatorAddress),
            identity: validatorIdentities.get(validatorAddress) || '',
          },
          totalReward: totalReward,
          totalRewardFormatted: formatBalance(totalReward),
        };
      },
    );

    

    await provider.disconnect();

    return {
      payouts: formattedPayouts,
      totalReward: formatBalance(totalRewardBN, { withUnit: true }),
    };
  } catch (error) {
    console.error('Error fetching payouts:', error);
    return { payouts: [], totalReward: '0 tTNT' };
  }
};
