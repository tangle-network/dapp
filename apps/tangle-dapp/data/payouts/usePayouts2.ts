'use client';

import { SpStakingExposure } from '@polkadot/types/lookup';
import { useCallback, useEffect, useState } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import { Payout } from '../../types';
import {
  formatTokenBalance,
  getPolkadotApiPromise,
  getValidatorCommission,
  getValidatorIdentity,
} from '../../utils/polkadot';
import useValidatorIdentityNames from '../ValidatorTables/useValidatorIdentityNames';
import useEraTotalRewards from './useEraTotalRewards';
import useLedgers from './useLedgers';

type ValidatorReward = {
  validatorAddress: string;
  era: number;
  eraTotalRewardPoints: number;
  validatorRewardPoints: number;
};

const usePayouts2 = () => {
  const { rpcEndpoint, nativeTokenSymbol } = useNetworkStore();
  const activeSubstrateAddress = useSubstrateAddress();
  const { data: ledgers } = useLedgers();

  const { data: erasRewardsPoints } = usePolkadotApiRx(
    useCallback((api) => api.query.staking.erasRewardPoints.entries(), [])
  );

  const { data: nominators } = usePolkadotApiRx(
    useCallback(
      (api) => {
        if (!activeSubstrateAddress) return null;
        return api.query.staking.nominators(activeSubstrateAddress);
      },
      [activeSubstrateAddress]
    )
  );

  const { data: identities } = useValidatorIdentityNames();
  const { data: eraTotalRewards } = useEraTotalRewards();
  const [payouts, setPayouts] = useState<Payout[] | null>(null);
  const nominations = nominators?.isSome ? nominators.unwrap().targets : null;

  useEffect(() => {
    if (
      nominations === null ||
      erasRewardsPoints === null ||
      ledgers === null ||
      identities === null ||
      activeSubstrateAddress === null ||
      eraTotalRewards === null
    ) {
      return;
    }

    const rewards: ValidatorReward[] = [];

    for (const validatorAddress of nominations) {
      for (const point of erasRewardsPoints) {
        const era = point[0].args[0].toNumber();
        const rewardsForEra = point[1];

        const validatorRewardPoints =
          rewardsForEra.individual.get(validatorAddress);

        // No entry for this validator in this era.
        if (validatorRewardPoints === undefined) {
          continue;
        }

        rewards.push({
          era,
          eraTotalRewardPoints: rewardsForEra.total.toNumber(),
          validatorAddress: validatorAddress.toString(),
          validatorRewardPoints: validatorRewardPoints.toNumber(),
        });
      }
    }

    const payoutsPromise = Promise.all(
      rewards.map(async (reward) => {
        const apiPromise = await getPolkadotApiPromise(rpcEndpoint);
        const ledgerOpt = ledgers.get(reward.validatorAddress);

        // There might not be a ledger for this validator.
        if (ledgerOpt === undefined || ledgerOpt.isNone) {
          return;
        }

        const ledger = ledgerOpt.unwrap();
        const claimedEras = ledger.claimedRewards.map((era) => era.toNumber());

        // Validator has already claimed rewards for this era, so it
        // is not relevant for the payouts.
        if (claimedEras.includes(reward.era)) {
          return;
        }

        const eraTotalRewardOpt = eraTotalRewards.get(reward.era);

        // No rewards for this era.
        if (eraTotalRewardOpt === undefined || eraTotalRewardOpt.isNone) {
          return;
        }

        const eraTotalReward = eraTotalRewardOpt.unwrap();

        // validator's total reward = (era's total reward * validator's points) / era's total reward points
        const validatorTotalReward = eraTotalReward
          .muln(reward.validatorRewardPoints)
          .divn(reward.eraTotalRewardPoints);

        // Validator had no rewards for this era.
        if (validatorTotalReward.isZero()) {
          return;
        }

        const eraStakers: SpStakingExposure =
          await apiPromise.query.staking.erasStakers(
            reward.era,
            reward.validatorAddress
          );

        const validatorTotalStake = eraStakers.total.unwrap();

        if (
          Number(validatorTotalStake.toString()) === 0 ||
          eraStakers.others.length === 0
        ) {
          return;
        }

        const nominatorStakeInfo = eraStakers.others.find(
          (nominator) => nominator.who.toString() === activeSubstrateAddress
        );

        if (!nominatorStakeInfo || nominatorStakeInfo.isEmpty) {
          return;
        }

        const nominatorTotalStake = nominatorStakeInfo.value.unwrap();

        if (nominatorTotalStake.isZero()) {
          return;
        }

        const nominatorStakePercentage =
          (Number(nominatorTotalStake.toString()) /
            Number(validatorTotalStake.toString())) *
          100;

        const validatorCommissionPercentage = await getValidatorCommission(
          rpcEndpoint,
          reward.validatorAddress
        );

        const validatorCommission = validatorTotalReward.muln(
          Number(validatorCommissionPercentage) / 100
        );

        const distributableReward =
          validatorTotalReward.sub(validatorCommission);

        const nominatorTotalReward = distributableReward.muln(
          nominatorStakePercentage / 100
        );

        const nominatorTotalRewardFormatted = formatTokenBalance(
          nominatorTotalReward,
          nativeTokenSymbol
        );

        const validatorIdentityName =
          identities.get(reward.validatorAddress) ?? null;

        const validatorNominators = await Promise.all(
          eraStakers.others.map(async (nominator) => {
            const nominatorIdentity = await getValidatorIdentity(
              rpcEndpoint,
              nominator.who.toString()
            );

            return {
              address: nominator.who.toString(),
              identity: nominatorIdentity ?? '',
            };
          })
        );

        const validatorTotalRewardFormatted = formatTokenBalance(
          validatorTotalReward,
          nativeTokenSymbol
        );

        const validatorTotalStakeFormatted = formatTokenBalance(
          validatorTotalStake,
          nativeTokenSymbol
        );

        if (
          validatorTotalStakeFormatted &&
          validatorTotalRewardFormatted &&
          nominatorTotalRewardFormatted
        ) {
          const payout: Payout = {
            era: reward.era,
            validator: {
              address: reward.validatorAddress,
              identity: validatorIdentityName ?? '',
            },
            validatorTotalStake: validatorTotalStakeFormatted,
            nominators: validatorNominators,
            validatorTotalReward: validatorTotalRewardFormatted,
            nominatorTotalReward: nominatorTotalRewardFormatted,
            status: 'unclaimed',
          };

          return payout;
        }
      })
    );

    payoutsPromise.then((payouts) =>
      setPayouts(
        payouts
          .filter((payout): payout is Payout => payout !== undefined)
          .sort((a, b) => a.era - b.era)
      )
    );
  });

  return payouts;
};

export default usePayouts2;
