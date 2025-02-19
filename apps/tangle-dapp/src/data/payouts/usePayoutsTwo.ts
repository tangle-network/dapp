import { useEffect, useState } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { BN } from '@polkadot/util';
import { formatBalance } from '@polkadot/util';
import type { u32 } from '@polkadot/types';
import type { EraIndex } from '@polkadot/types/interfaces';
import type { Option } from '@polkadot/types/codec';
import type { PalletStakingStakingLedger } from '@polkadot/types/lookup';

interface PayoutInfo {
  eras: string;
  own: string;
  remaining: string;
}

interface UsePayoutsResult {
  payouts: PayoutInfo[];
  isLoading: boolean;
  error: Error | null;
  totalReward: string; // Added total reward
}

const HISTORY_DEPTH = 84;

const usePayoutsTwo = (
  address: string,
  wsEndpoint = 'wss://rpc.polkadot.io',
): UsePayoutsResult => {
  const [payouts, setPayouts] = useState<PayoutInfo[]>([]);
  const [totalReward, setTotalReward] = useState<string>('0 tTNT');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let api: ApiPromise;
    let unsubscribe: (() => void) | undefined;

    const fetchPayouts = async () => {
      try {
        // 1. Initialize API
        const provider = new WsProvider(wsEndpoint);
        api = await ApiPromise.create({ provider });

        // Set up the token decimals and symbol
        formatBalance.setDefaults({
          decimals: api.registry.chainDecimals[0],
          unit: 'tTNT',
        });

        // 2. Get current era
        const currentEraResult = await api.query.staking.currentEra();
        const currentEra = (currentEraResult as Option<u32>).isSome
          ? (currentEraResult as Option<u32>).unwrap()
          : api.createType('u32', 0);

        // 3. Calculate the eras we want to fetch
        const startEra = Math.max(0, currentEra.toNumber() - HISTORY_DEPTH);
        const eras: EraIndex[] = [];

        for (let era = startEra; era <= currentEra.toNumber(); era++) {
          eras.push(api.createType('EraIndex', era));
        }

        // 4. Get the staking ledger to check claimed rewards
        const stakingLedgerOpt = await api.query.staking.ledger(address);

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
          [address],
          eras,
        );

        // Track total rewards
        let totalRewardBN = new BN(0);

        // 6. Format the rewards data
        const formattedPayouts = rewards[0]
          .filter((reward) => !reward.isEmpty)
          .map((reward) => {
            const era = reward.era;
            const validators = reward.validators;
            const totalReward = Object.values(validators).reduce(
              (total, { value }) => total.add(value),
              new BN(0),
            );

            // Add to total rewards
            totalRewardBN = totalRewardBN.add(totalReward);

            const isClaimed = claimedEras.some((claimedEra) =>
              claimedEra.eq(era),
            );

            return {
              eras: era.toString(),
              own: formatBalance(totalReward, { withUnit: true }),
              remaining: isClaimed
                ? '0 tTNT'
                : formatBalance(totalReward, { withUnit: true }),
            };
          })
          .sort((a, b) => parseInt(b.eras) - parseInt(a.eras));

        // Format total rewards
        const formattedTotal = formatBalance(totalRewardBN, { withUnit: true });

        setPayouts(formattedPayouts);
        setTotalReward(formattedTotal);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching payouts:', err);
        setError(
          err instanceof Error ? err : new Error('Failed to fetch payouts'),
        );
        setIsLoading(false);
      }
    };

    fetchPayouts();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (api) {
        api.disconnect();
      }
    };
  }, [address, wsEndpoint]);

  return { payouts, isLoading, error, totalReward };
};

export default usePayoutsTwo;
