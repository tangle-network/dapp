'use client';

import { PalletStakingValidatorPrefs } from '@polkadot/types/lookup';
import { BN_ZERO } from '@polkadot/util';
import { useCallback, useEffect, useMemo, useState } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import { Payout } from '../../types';
import {
  formatTokenBalance,
  getPolkadotApiPromise,
  getValidatorIdentity,
} from '../../utils/polkadot';
import useEraTotalRewards from '../payouts/useEraTotalRewards';

type ValidatorReward = {
  validatorAddress: string;
  era: number;
  eraTotalRewardPoints: number;
  validatorRewardPoints: number;
};

export default function usePayouts() {
  const [payouts, setPayouts] = useState<Payout[] | null>(null);

  const { rpcEndpoint, nativeTokenSymbol } = useNetworkStore();

  const activeSubstrateAddress = useSubstrateAddress();

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

  const myNominations = useMemo(() => {
    if (!nominators) return [];
    return nominators.isSome ? nominators.unwrap().targets : [];
  }, [nominators]);

  const { data: eraTotalRewards } = useEraTotalRewards();

  const { data: validators } = usePolkadotApiRx(
    useCallback((api) => api.query.staking.validators.entries(), [])
  );

  const mappedValidatorInfo = useMemo(() => {
    const map = new Map<string, PalletStakingValidatorPrefs>();

    validators?.forEach(([storageKey, validatorInfo]) => {
      map.set(storageKey.args[0].toString(), validatorInfo);
    });

    return map;
  }, [validators]);

  useEffect(() => {
    if (
      !erasRewardsPoints ||
      myNominations.length === 0 ||
      !eraTotalRewards ||
      !mappedValidatorInfo ||
      !activeSubstrateAddress
    ) {
      return;
    }

    const allRewards: ValidatorReward[] = [];

    for (const validatorAddress of myNominations) {
      for (const point of erasRewardsPoints) {
        const era = point[0].args[0].toNumber();
        const rewards = point[1].toHuman();
        let validatorRewardPoints = 0;
        const totalRewardPoints = parseFloat(
          rewards.total?.toString().replace(/,/g, '') ?? '0'
        );
        if (
          typeof rewards.individual === 'object' &&
          rewards.individual !== null
        ) {
          Object.entries(rewards.individual).forEach(([key, value]) => {
            if (key === validatorAddress.toString()) {
              validatorRewardPoints = Number(value);
            }
          });
        }
        allRewards.push({
          era,
          eraTotalRewardPoints: totalRewardPoints,
          validatorAddress: validatorAddress.toString(),
          validatorRewardPoints,
        });
      }
    }

    const payoutsPromises = Promise.all(
      allRewards.map(async (reward) => {
        const apiPromise = await getPolkadotApiPromise(rpcEndpoint);

        const eraTotalRewardOpt = eraTotalRewards.get(reward.era);
        if (eraTotalRewardOpt === undefined || eraTotalRewardOpt.isNone) {
          return;
        }

        const eraTotalReward = eraTotalRewardOpt.unwrap();

        const validatorTotalReward = eraTotalReward
          .muln(reward.validatorRewardPoints)
          .divn(reward.eraTotalRewardPoints);

        if (validatorTotalReward.isZero()) {
          return;
        }

        const erasStakersOverview =
          await apiPromise.query.staking.erasStakersOverview(
            reward.era,
            reward.validatorAddress
          );

        const validatorTotalStake = !erasStakersOverview.isNone
          ? erasStakersOverview.unwrap().total.toBn()
          : BN_ZERO;
        const validatorNominatorCount = !erasStakersOverview.isNone
          ? erasStakersOverview.unwrap().nominatorCount.toNumber()
          : 0;

        if (
          Number(validatorTotalStake) === 0 ||
          validatorNominatorCount === 0
        ) {
          return;
        }

        const eraStakerPaged = await apiPromise.query.staking.erasStakersPaged(
          reward.era,
          reward.validatorAddress,
          0
        );

        if (eraStakerPaged.isNone) {
          return;
        }

        const nominatorStakeInfo = eraStakerPaged
          .unwrap()
          .others.find(
            (nominator) => nominator.who.toString() === activeSubstrateAddress
          );

        if (nominatorStakeInfo === undefined || nominatorStakeInfo.isEmpty) {
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

        const validatorInfo = mappedValidatorInfo.get(reward.validatorAddress);

        if (!validatorInfo) {
          return;
        }

        const validatorCommissionPercentage =
          validatorInfo.commission.toNumber();

        const validatorCommission = validatorTotalReward.muln(
          validatorCommissionPercentage / 100
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

        const validatorIdentityName = await getValidatorIdentity(
          rpcEndpoint,
          reward.validatorAddress
        );

        const validatorNominators = await Promise.all(
          eraStakerPaged.unwrap().others.map(async (nominator) => {
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

    payoutsPromises.then((payouts) =>
      setPayouts(
        payouts
          .filter((payout): payout is Payout => payout !== undefined)
          .sort((a, b) => a.era - b.era)
      )
    );
  }, [
    activeSubstrateAddress,
    eraTotalRewards,
    erasRewardsPoints,
    mappedValidatorInfo,
    myNominations,
    nativeTokenSymbol,
    rpcEndpoint,
  ]);

  return payouts;
}
