import { ApiPromise, WsProvider } from '@polkadot/api';
import { BN, formatBalance } from '@polkadot/util';
import type { Option } from '@polkadot/types';
import type { EraIndex } from '@polkadot/types/interfaces';
import type { PalletStakingStakingLedger } from '@polkadot/types/lookup';
import {
  Payout,
  TangleTokenSymbol,
} from '@tangle-network/tangle-shared-ui/types';
import assertSubstrateAddress from '@tangle-network/ui-components/utils/assertSubstrateAddress';

// Get legacy claimed rewards from staking ledger
function getLegacyClaimedEras(
  stakingLedger: PalletStakingStakingLedger,
  api: ApiPromise,
): EraIndex[] {
  let claimedEras: number[] = [];

  try {
    // Try to get claimed rewards from JSON structure first
    const ledgerData = stakingLedger.toJSON();
    if (
      ledgerData?.claimedRewards &&
      Array.isArray(ledgerData.claimedRewards)
    ) {
      claimedEras = ledgerData.claimedRewards
        .filter((era): era is number => typeof era === 'number')
        .map(Number);
    } else {
      // Fallback: try to access claimed rewards through the ledger structure
      const claimed = stakingLedger.get('claimedRewards');
      if (claimed && Array.isArray(claimed)) {
        claimedEras = claimed
          .map((era) => era.toNumber())
          .filter((era): era is number => typeof era === 'number');
      }
    }
  } catch (error) {
    console.warn('Error getting claimed eras:', error);
    return claimedEras.map((era) => api.createType('EraIndex', era));
  }

  // Convert to EraIndex type and return
  return claimedEras.map((era) => api.createType('EraIndex', era));
}

export const getPayouts = async (
  address: string | null,
  rpcEndpoints: string[] | null,
  nativeTokenSymbol: TangleTokenSymbol,
): Promise<{
  payouts: Payout[] | null;
  totalReward: string;
}> => {
  const defaultReturn = {
    payouts: null,
    totalReward: '0',
  };

  if (!address || !rpcEndpoints) {
    return defaultReturn;
  }

  try {
    // 1. Initialize API
    const provider = new WsProvider(rpcEndpoints);
    const api = await ApiPromise.create({ provider });

    // Get active era
    const activeEraOpt = await api.query.staking.activeEra();
    if (activeEraOpt.isNone) {
      await provider.disconnect();
      return defaultReturn;
    }

    const activeEra = activeEraOpt.unwrap();
    const activeEraNumber = activeEra.index.toNumber();

    // Calculate era range based on history depth
    const historyDepth = 80;
    const startEra = Math.max(1, activeEraNumber - historyDepth);
    const filteredEras: EraIndex[] = Array.from(
      { length: activeEraNumber - startEra + 1 },
      (_, i) => api.createType('EraIndex', startEra + i),
    );

    // Early return if no eras to process
    if (filteredEras.length === 0) {
      await provider.disconnect();
      return defaultReturn;
    }

    // Get staking ledger and claimed rewards
    const stakingLedgerOpt = await api.query.staking.ledger(address);
    let claimedEras: EraIndex[] = [];

    if ((stakingLedgerOpt as Option<PalletStakingStakingLedger>).isSome) {
      const stakingLedger = (
        stakingLedgerOpt as Option<PalletStakingStakingLedger>
      ).unwrap();
      claimedEras = getLegacyClaimedEras(stakingLedger, api);
    }

    // Get rewards for filtered eras
    const rewards = await api.derive.staking.stakerRewardsMultiEras(
      [address],
      filteredEras,
    );

    // Return if no rewards
    if (!rewards?.[0]?.length) {
      await provider.disconnect();
      return defaultReturn;
    }

    // Initialize data structures
    const rewardsByValidator = new Map<
      string,
      {
        eras: number[];
        totalReward: BN;
      }
    >();
    const validatorAddresses = new Set<string>();

    // Collect all validator addresses and filter claimed rewards
    const validRewards = rewards[0].filter((reward) => {
      // Skip empty rewards
      if (reward.isEmpty) return false;

      // Skip if era has been claimed
      const eraNumber = reward.era.toNumber();
      if (claimedEras.some((claimed) => claimed.toNumber() === eraNumber)) {
        return false;
      }

      // Add validator addresses
      Object.keys(reward.validators).forEach((validatorId) => {
        validatorAddresses.add(validatorId);
      });

      return true;
    });

    // Get validator identities
    const validatorIdentities = new Map<string, string | null>();
    await Promise.all(
      Array.from(validatorAddresses).map(async (validatorId) => {
        const identity = await api.derive.accounts.identity(validatorId);
        if (identity.displayParent || identity.display) {
          validatorIdentities.set(
            validatorId,
            identity.displayParent
              ? `${identity.displayParent}/${identity.display}`
              : identity.display || null,
          );
        }
      }),
    );

    // Group rewards by validator
    let totalRewardBN = new BN(0);
    validRewards.forEach((reward) => {
      Object.entries(reward.validators).forEach(([validatorId, { value }]) => {
        if (!value.isZero()) {
          const eraNumber = reward.era.toNumber();
          const existing = rewardsByValidator.get(validatorId) || {
            eras: [],
            totalReward: new BN(0),
          };

          if (!existing.eras.includes(eraNumber)) {
            existing.eras.push(eraNumber);
            existing.totalReward = existing.totalReward.add(value);
            totalRewardBN = totalRewardBN.add(value);
          }

          rewardsByValidator.set(validatorId, existing);
        }
      });
    });

    // Format payouts
    const formattedPayouts = Array.from(rewardsByValidator.entries())
      .map(([validatorId, { eras, totalReward }]) => ({
        eras,
        validator: {
          address: assertSubstrateAddress(validatorId),
          identity: validatorIdentities.get(validatorId) || null,
        },
        totalReward,
        totalRewardFormatted: formatBalance(totalReward, {
          withUnit: nativeTokenSymbol,
        }),
      }))
      .sort((a, b) => b.totalReward.cmp(a.totalReward)); // Sort by highest reward first

    await provider.disconnect();

    return {
      payouts: formattedPayouts,
      totalReward: formatBalance(totalRewardBN, {
        withUnit: nativeTokenSymbol,
      }),
    };
  } catch (error) {
    console.error('Error fetching payouts:', error);
    return {
      payouts: [
        {
          eras: [],
          validator: {
            address: assertSubstrateAddress(address),
            identity: null,
          },
          totalReward: new BN(0),
          totalRewardFormatted: '0',
        },
      ],
      totalReward: '0',
    };
  }
};
