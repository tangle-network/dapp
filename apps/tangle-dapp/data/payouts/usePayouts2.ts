'use client';

import { SpStakingExposure } from '@polkadot/types/lookup';
import { useCallback, useEffect, useState } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import useApiRx from '../../hooks/useApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import { Payout } from '../../types';
import {
  formatTokenBalance,
  getApiPromise,
  getValidatorCommission,
  getValidatorIdentityName,
} from '../../utils/polkadot';
import useValidatorIdentityNames from '../ValidatorTables/useValidatorIdentityNames';
import useAllLedgers from './useAllLedgers';
import useEraTotalRewards from './useEraTotalRewards';

type ValidatorReward = {
  validatorAddress: string;
  era: number;
  eraTotalRewardPoints: number;
  validatorRewardPoints: number;
};

const usePayouts2 = () => {
  const { rpcEndpoint, nativeTokenSymbol } = useNetworkStore();
  const activeSubstrateAddress = useSubstrateAddress();
  const { data: ledgers } = useAllLedgers();

  const { result: erasRewardsPoints } = useApiRx(
    useCallback((api) => api.query.staking.erasRewardPoints.entries(), [])
  );

  const { result: nominators } = useApiRx(
    useCallback(
      (api) => {
        if (activeSubstrateAddress === null) {
          return null;
        }

        return api.query.staking.nominators(activeSubstrateAddress);
      },
      [activeSubstrateAddress]
    )
  );

  const { result: identities } = useValidatorIdentityNames();
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
        const apiPromise = await getApiPromise(rpcEndpoint);
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
            const nominatorIdentity = await getValidatorIdentityName(
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
