'use client';

import { Option } from '@polkadot/types';
import {
  PalletStakingNominations,
  PalletStakingValidatorPrefs,
} from '@polkadot/types/lookup';
import { BN_ZERO } from '@polkadot/util';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import { Payout } from '../../types';
import formatBnToDisplayAmount from '../../utils/formatBnToDisplayAmount';
import {
  getPolkadotApiPromise,
  getValidatorIdentityName,
} from '../../utils/polkadot';
import useEraTotalRewards from '../payouts/useEraTotalRewards';

type ValidatorReward = {
  validatorAddress: string;
  era: number;
  eraTotalRewardPoints: number;
  validatorRewardPoints: number;
};

export default function usePayouts() {
  const { rpcEndpoint } = useNetworkStore();

  const activeSubstrateAddress = useSubstrateAddress();

  const { data: nominators } = usePolkadotApiRx(
    useCallback(
      (api) => api.query.staking.nominators(activeSubstrateAddress),
      [activeSubstrateAddress]
    )
  );

  const { data: erasRewardsPoints } = usePolkadotApiRx(
    useCallback((api) => api.query.staking.erasRewardPoints.entries(), [])
  );

  const myNominations = useMemo(() => {
    if (!nominators) return [];
    const nominatorsData = nominators as Option<PalletStakingNominations>;
    return nominatorsData.isSome ? nominatorsData.unwrap().targets : [];
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

  const payoutPromises = useMemo(() => {
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

    return Promise.all(
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

        const nominatorTotalRewardFormatted = formatBnToDisplayAmount(
          nominatorTotalReward,
          {
            fractionLength: 4,
            includeCommas: true,
            padZerosInFraction: true,
          }
        );

        const validatorIdentityName = await getValidatorIdentityName(
          rpcEndpoint,
          reward.validatorAddress
        );

        const validatorNominators = await Promise.all(
          eraStakerPaged.unwrap().others.map(async (nominator) => {
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

        const validatorTotalRewardFormatted = formatBnToDisplayAmount(
          validatorTotalReward,
          {
            fractionLength: 4,
            includeCommas: true,
            padZerosInFraction: true,
          }
        );

        const validatorTotalStakeFormatted = formatBnToDisplayAmount(
          validatorTotalReward,
          {
            fractionLength: 4,
            includeCommas: true,
            padZerosInFraction: true,
          }
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
            nominatorTotalRewardRaw: nominatorTotalReward,
          };

          return payout;
        }
      })
    );
  }, [
    activeSubstrateAddress,
    eraTotalRewards,
    erasRewardsPoints,
    mappedValidatorInfo,
    myNominations,
    rpcEndpoint,
  ]);

  const payoutsRef = useRef<Payout[]>([]);

  useEffect(() => {
    const computePayouts = async () => {
      if (!payoutPromises) {
        payoutsRef.current = [];
      } else {
        const payouts = await payoutPromises;
        payoutsRef.current = payouts
          .filter((payout): payout is Payout => payout !== undefined)
          .sort((a, b) => a.era - b.era);
      }
    };

    computePayouts();
  }, [payoutPromises]);

  return payoutsRef.current;
}
